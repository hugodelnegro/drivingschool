'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.min.css';

import { quizData, type Q } from '@/lib/data';

export type QuizSummary = {
  numberOfCorrectAnswers: number;
  numberOfIncorrectAnswers: number;
  numberOfQuestions: number;
  totalPoints: number;
  correctPoints: number;
  userInput: Array<number | number[]>;
  questions: Q[];
};

interface Props {
  onComplete?: (summary: QuizSummary) => void;
}

/** Pure functional (inside-out) Fisher–Yates shuffle */
const shuffle = <T,>(xs: readonly T[]) =>
  xs.reduce<T[]>((acc, x, i) => {
    const j = Math.floor(Math.random() * (i + 1));
    const next = acc.slice();
    next[i] = next[j];
    next[j] = x;
    return next;
  }, []);

export default function DrivingSchoolSurvey({ onComplete }: Props) {
  /** Gate rendering until shuffle is ready */
  const [shuffled, setShuffled] = useState<Q[] | null>(null);

  useEffect(() => {
    // Ensure this runs on the client and only once
    setShuffled(shuffle(quizData));
  }, []);

  /** Build Survey JSON only after shuffle is ready */
  const json = useMemo(() => {
    if (!shuffled) return null;

    return {
      showQuestionNumbers: 'off',
      navigationButtonsVisibility: 'visible',
      showPrevButton: false, // hide Back button
      pageNextText: 'Next',
      completeText: 'Finish',
      // We DO NOT use questionsOrder:'random' so the image stays on top.
      pages: shuffled.map((q, i) => {
        const name = `q${i + 1}`;
        const contBtnId = `${name}__continue`;

        return {
          elements: [
            // 1) Image ALWAYS first
            ...(q.photo
              ? [
                  {
                    type: 'html',
                    name: `${name}__photo`,
                    html: `
                      <div style="text-align:center;margin-bottom:16px;">
                        <img src="${q.photo}" alt="Question image"
                             style="max-width:100%;max-height:300px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.1);" />
                      </div>
                    `,
                  },
                ]
              : []),

            // 2) Question
            {
              type: q.type === 'multiple' ? 'checkbox' : 'radiogroup',
              name,
              title: q.question,
              isRequired: true,
              choices: q.answers.map((text, idx) => ({ value: idx + 1, text })),
              correctAnswer: q.correctAnswer,
              choicesOrder: 'random', // shuffle answers per render
            },

            // 3) Feedback container with a Continue button
            {
              type: 'html',
              name: `${name}__fb`,
              visible: false,
              html: `
                <div data-fb-wrapper style="margin-top:10px">
                  <!-- dynamic message injected on submit -->
                  <button id="${contBtnId}" type="button"
                    style="margin-top:12px;padding:8px 14px;border-radius:8px;border:1px solid #ddd;cursor:pointer">
                    Continue
                  </button>
                </div>
              `,
            },
          ],
        };
      }),
    };
  }, [shuffled]);

  /** Create the Survey model only when JSON exists */
  const model = useMemo(() => (json ? new Model(json) : null), [json]);

  /** Wire up logic once model is ready */
  useEffect(() => {
    if (!model || !shuffled) return;

    // Disallow navigating back programmatically (extra safety)
    const blockPrev = (_sender: Model, options: any) => {
      if (options.isPrevPage) options.allowChanging = false;
    };

    // Treat "Next" as submit: show feedback + lock; user advances by clicking "Continue".
    const onNextAsSubmit = (sender: Model, options: any) => {
  if (!options.isNextPage) return;

  const page = sender.currentPage;
  const q: any = page?.questions?.[0];           // first real question on the page
  if (!q) return;

  // Let required validation handle empty answers
  if (q.isEmpty && q.isEmpty()) return;

  // If feedback already visible, allow navigation (user likely clicked Continue previously)
  const fb: any = sender.getQuestionByName(`${q.name}__fb`);
  if (fb?.visible) return;

  // Figure out which item in your shuffled data this question is
  const idx = Number(String(q.name).slice(1)) - 1; // q1 -> 0, q2 -> 1, ...
  const meta = shuffled![idx];

  const ok = typeof q.isAnswerCorrect === 'function' ? q.isAnswerCorrect() : false;

  // 🔹 Set the feedback HTML directly (no DOM juggling)
  const contBtnId = `${q.name}__continue`;
  fb.html = `
    <div data-fb-wrapper style="margin-top:10px">
      ${ok
        ? `✅ ${meta.okMsg}`
        : `❌ ${meta.koMsg}<div style="margin-top:6px;opacity:.8">${meta.explanation}</div>`}
      <button id="${contBtnId}" type="button"
        style="margin-top:12px;padding:8px 14px;border-radius:8px;border:1px solid #ddd;cursor:pointer">
        Continue
      </button>
    </div>
  `;
  fb.visible = true;

  // Lock the answered question and block this navigation
  q.readOnly = true;
  options.allowChanging = false;
}

    // Wire the "Continue" buttons that live inside the HTML feedback blocks
    const onAfterRenderQuestion = (sender: Model, opt: any) => {
  const fbQ = opt.question;
  if (!fbQ || typeof fbQ.name !== 'string' || !fbQ.name.endsWith('__fb') || !fbQ.visible) return;

  const baseName = fbQ.name.replace('__fb', '');
  const btn = opt.htmlElement.querySelector<HTMLButtonElement>(`#${baseName}__continue`);
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      fbQ.visible = false;   // optional: hide feedback before moving on
      sender.nextPage();     // advance (or finish)
    });
  }
};

    // Replace completion page with a full review (reveal answers)
    const onCompleteHandler = (sender: Model) => {
      let correct = 0;
      let totalPts = 0;
      let correctPts = 0;

      const reviewBlocks: string[] = [];

      // Use the shuffled order to read answers back by stable names q1..qn
      shuffled.forEach((meta, i) => {
        const qName = `q${i + 1}`;
        const qq: any = sender.getQuestionByName(qName);
        const pts = meta.point ?? 0;
        totalPts += pts;

        const userVal = qq?.value;
        const userArr = Array.isArray(userVal) ? userVal : userVal != null ? [userVal] : [];
        const ok = typeof qq?.isAnswerCorrect === 'function' && qq.isAnswerCorrect();
        if (ok) {
          correct += 1;
          correctPts += pts;
        }

        const choiceText = (arr: number[]) => arr.map((v) => meta.answers[v - 1]).join(', ');
        const userText = choiceText(userArr as number[]);
        const correctArr = Array.isArray(meta.correctAnswer) ? meta.correctAnswer : [meta.correctAnswer];
        const correctText = choiceText(correctArr as number[]);

        reviewBlocks.push(`
          <div style="padding:14px 16px;border:1px solid #eee;border-radius:10px;margin-bottom:12px">
            <div style="font-weight:600;margin-bottom:6px">${i + 1}. ${meta.question}</div>
            <div style="margin:6px 0">
              <span style="font-weight:600">Your answer:</span>
              <span style="color:${ok ? '#15803d' : '#b91c1c'}">${userText || '—'}</span>
            </div>
            <div style="margin:6px 0">
              <span style="font-weight:600">Correct answer:</span>
              <span style="color:#15803d">${correctText}</span>
            </div>
            <div style="margin-top:6px;opacity:.8">${meta.explanation}</div>
          </div>
        `);
      });

      const scorePct = Math.round((correct / shuffled.length) * 100);

      sender.completedHtml = `
        <div style="max-width:800px;margin:0 auto">
          <h2 style="font-size:24px;margin-bottom:8px">Quiz Complete 🎉</h2>
          <div style="margin-bottom:12px">
            <strong>Score:</strong> ${correct}/${shuffled.length} (${scorePct}%)
            &nbsp;·&nbsp; <strong>Points:</strong> ${correctPts}/${totalPts}
          </div>
          ${reviewBlocks.join('')}
        </div>
      `;

      const userInput = sender.getAllQuestions().map((q: any) => q.value) as Array<number | number[]>;
      onComplete?.({
        numberOfCorrectAnswers: correct,
        numberOfIncorrectAnswers: shuffled.length - correct,
        numberOfQuestions: shuffled.length,
        totalPoints: totalPts,
        correctPoints: correctPts,
        userInput,
        questions: shuffled,
      });
    };

    model.onCurrentPageChanging.add(blockPrev);
    model.onCurrentPageChanging.add(onNextAsSubmit);
    model.onAfterRenderQuestion.add(onAfterRenderQuestion);
    model.onComplete.add(onCompleteHandler);

    return () => {
      model.onCurrentPageChanging.remove(blockPrev);
      model.onCurrentPageChanging.remove(onNextAsSubmit);
      model.onAfterRenderQuestion.remove(onAfterRenderQuestion);
      model.onComplete.remove(onCompleteHandler);
    };
  }, [model, shuffled, onComplete]);

  /** Loading state until shuffle/model are ready */
  if (!model) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
          <div className="h-48 w-full bg-gray-200 rounded mb-4" />
          <div className="h-10 w-28 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Survey model={model} />
    </div>
  );
}

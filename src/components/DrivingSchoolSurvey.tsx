'use client';

import React, { useMemo, useEffect } from 'react';
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

export default function DrivingSchoolSurvey({ onComplete }: Props) {
  // Fisher–Yates shuffle to randomize page (question) order once
const shuffled = [...quizData];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Build survey JSON:
  // - ONE question per page
  // - Image rendered as an HTML element placed FIRST in `elements` so it ALWAYS stays on top
  // - We randomize PAGE order ourselves (so we don't rely on questionsOrder that might reorder elements)
const json = useMemo(() => {
  // Fisher–Yates to shuffle pages once (on first render)
  const shuffled = [...quizData];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return {
    showQuestionNumbers: 'off',
    navigationButtonsVisibility: 'visible',
    showPrevButton: false,
    pageNextText: 'Next',
    completeText: 'Finish',
    // IMPORTANT: don't set questionsOrder: 'random' here,
    // it randomizes elements inside a page and can move the image.

    pages: shuffled.map((q, i) => {
      const name = `q${i + 1}`;
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

          // 3) Feedback container
          {
            type: 'html',
            name: `${name}__fb`,
            visible: false,
            html: `
              <div data-fb-wrapper style="margin-top:10px">
                <!-- dynamic message injected on submit -->
              </div>
            `,
          },
        ],
      };
    }),
  };
}, []);
  const model = useMemo(() => new Model(json), [json]);

  useEffect(() => {
    // Disallow navigating back programmatically (extra safety)
    const blockPrev = (_sender: Model, options: any) => {
      if (options.isPrevPage) options.allowChanging = false;
    };

    // Treat "Next" as submit: show feedback + lock; user advances by clicking "Continue".
const onNextAsSubmit = (sender: Model, options: any) => {
  if (!options.isNextPage) return;

  const page = sender.currentPage;

  // ✅ Get the first actual choice question, not the HTML photo block
  const q: any = page?.questions?.find(
    (qq: any) => typeof qq.getType === 'function' && (qq.getType() === 'radiogroup' || qq.getType() === 'checkbox')
  );
  if (!q) return;

  // Answered?
  const answered = Array.isArray(q.value)
    ? q.value.length > 0
    : q.value !== undefined && q.value !== null;
  if (!answered) return; // let 'required' validation do its thing

  const fbName = `${q.name}__fb`;
  const fb: any = sender.getQuestionByName(fbName);
  if (!fb) {
    console.warn('Feedback element not found:', fbName);
    return;
  }
  if (fb.visible) return; // already showed feedback once

  // Map back to shuffled item: q1 -> 0, q2 -> 1, ...
  const idx = Number(String(q.name).slice(1)) - 1;
  const meta = shuffled![idx];

  // Correctness (order-agnostic for multiple)
  const val = q.value as number | number[];
  let ok = false;
  if (Array.isArray(meta.correctAnswer)) {
    const corr = new Set(meta.correctAnswer);
    const chosen = new Set(Array.isArray(val) ? val : []);
    ok = corr.size === chosen.size && [...corr].every(v => chosen.has(v));
  } else {
    ok = val === meta.correctAnswer;
  }

  // Write feedback HTML (message + Continue button)
  const contBtnId = `${q.name}__continue`;
  fb.html = `
    <div data-fb-wrapper style="margin-top:10px">
      ${
        ok
          ? `✅ ${meta.okMsg}`
          : `❌ ${meta.koMsg}<div style="margin-top:6px;opacity:.8">${meta.explanation}</div>`
      }
      
    </div>
  `;
  fb.visible = true;

  q.readOnly = true;          // lock answer
  options.allowChanging = false; // block this Next; user must click Continue
};

    // Wire the "Continue" buttons that live inside the HTML feedback blocks
 const onAfterRenderQuestion = (sender: Model, opt: any) => {
  const fbQ = opt.question;
  if (!fbQ || typeof fbQ.name !== 'string' || !fbQ.name.endsWith('__fb') || !fbQ.visible) return;

  const base = fbQ.name.slice(0, -'__fb'.length);
  const btn = opt.htmlElement.querySelector<HTMLButtonElement>(`#${base}__continue`);
  if (btn && !btn.dataset.bound) {
    btn.dataset.bound = '1';
    btn.addEventListener('click', () => {
      fbQ.visible = false;   // optional: hide feedback before moving on
      sender.nextPage();     // advance to next page (or complete)
    });
  }
};

    // Replace completion page with a full review (reveal answers)
    const onCompleteHandler = (sender: Model) => {
      let correct = 0;
      let totalPts = 0;
      let correctPts = 0;

      const reviewBlocks: string[] = [];

      // Build a stable map from question title to data (since we shuffled pages)
      const byTitle = new Map(quizData.map((q) => [q.question, q]));

      // Iterate through all rendered questions (one per page)
      sender.getAllQuestions().forEach((qq: any, i: number) => {
        const meta = byTitle.get(String(qq.title));
        if (!meta) return;

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

      const scorePct = Math.round((correct / quizData.length) * 100);

      sender.completedHtml = `
        <div style="max-width:800px;margin:0 auto">
          <h2 style="font-size:24px;margin-bottom:8px">Quiz Complete 🎉</h2>
          <div style="margin-bottom:12px">
            <strong>Score:</strong> ${correct}/${quizData.length} (${scorePct}%)
            &nbsp;·&nbsp; <strong>Points:</strong> ${correctPts}/${totalPts}
          </div>
          ${reviewBlocks.join('')}
        </div>
      `;

      const userInput = sender.getAllQuestions().map((q: any) => q.value) as Array<number | number[]>;

      onComplete?.({
        numberOfCorrectAnswers: correct,
        numberOfIncorrectAnswers: quizData.length - correct,
        numberOfQuestions: quizData.length,
        totalPoints: totalPts,
        correctPoints: correctPts,
        userInput,
        questions: quizData,
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
  }, [model, onComplete]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <Survey model={model} />
    </div>
  );
}

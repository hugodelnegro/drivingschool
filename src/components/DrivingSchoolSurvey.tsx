'use client';

import React, { useMemo, useEffect } from 'react';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import 'survey-core/survey-core.min.css';

import { quizData, Q } from '@/lib/data';

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
  // One question per page + hidden feedback with a Continue button
  const json = useMemo(
    () => ({
      showQuestionNumbers: 'off',
      navigationButtonsVisibility: 'visible',
      //pagePrevText: 'Back',
      showPrevButton: false,
      pageNextText: 'Next',
      completeText: 'Finish',
      questionsOrder: 'random',
      pages: quizData.map((q, i) => {
        const name = `q${i + 1}`;
        return {
          elements: [
            ...(q.photo ? [{
              type: 'html',
              name: `${name}__photo`,
              html: `
                <div style="text-align: center; margin-bottom: 16px;">
                  <img src="${q.photo}" alt="Question image" style="max-width: 100%; max-height: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
                </div>
              `
            }] : []),
            {
              type: q.type === 'multiple' ? 'checkbox' : 'radiogroup',
              name,
              title: q.question,
              isRequired: true,
              choices: q.answers.map((text, idx) => ({ value: idx + 1, text })),
              correctAnswer: q.correctAnswer,
              choicesOrder: 'random'
            },
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
    }),
    []
  );

  const model = useMemo(() => new Model(json), [json]);

  useEffect(() => {
    // Next acts as "submit round": show feedback + lock; advance on Continue
    const onNextAsSubmit = (sender: Model, options: any) => {
      if (!options.isNextPage) return;

      const page = sender.currentPage;
      const q: any = page?.questions?.[0];
      if (!q) return;
      if (q.isEmpty && q.isEmpty()) return; // let required validation work

      const fb: any = sender.getQuestionByName(`${q.name}__fb`);
      if (fb?.visible) return; // already showed feedback; allow navigation

      const idx = Number(String(q.name).slice(1)) - 1;
      const meta = quizData[idx];
      const ok = typeof q.isAnswerCorrect === 'function' ? q.isAnswerCorrect() : false;

      if (fb) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = fb.html as string;
        const msg = document.createElement('div');
        msg.innerHTML = ok
          ? `✅ ${meta.okMsg}`
          : `❌ ${meta.koMsg}<div style="margin-top:6px;opacity:.8">${meta.explanation}</div>`;
        const container = wrapper.querySelector('[data-fb-wrapper]');
        container?.insertBefore(msg, container.firstChild);
        fb.html = container?.parentElement ? container.parentElement.innerHTML : wrapper.innerHTML;
        fb.visible = true;
      }

      q.readOnly = true;
      options.allowChanging = false; // block this Next; user clicks Continue
    };

    // Attach click to Continue button inside feedback
    const onAfterRenderQuestion = (sender: Model, opt: any) => {
      const q = opt.question;
      if (!q || typeof q.name !== 'string' || !q.name.endsWith('__fb') || !q.visible) return;

      const name = q.name.replace('__fb', '');
      const btn = opt.htmlElement.querySelector<HTMLButtonElement>(`#${name}__continue`);
      if (btn && !btn.dataset.bound) {
        btn.dataset.bound = '1';
        btn.addEventListener('click', () => {
          q.visible = false;           // optional: hide feedback before moving on
          sender.nextPage();           // go to next (or finish)
        });
      }
    };

    // Replace completed page with full review (reveal answers)
    const onCompleteHandler = (sender: Model) => {
      let correct = 0, totalPts = 0, correctPts = 0;
      const review: string[] = [];

      quizData.forEach((meta, i) => {
        const qName = `q${i + 1}`;
        const qq: any = sender.getQuestionByName(qName);
        const pts = meta.point ?? 0;
        totalPts += pts;

        const userVal = qq?.value;
        const userArr = Array.isArray(userVal) ? userVal : userVal != null ? [userVal] : [];
        const ok = typeof qq?.isAnswerCorrect === 'function' && qq.isAnswerCorrect();
        if (ok) { correct += 1; correctPts += pts; }

        const pickText = (arr: number[]) => arr.map((v) => meta.answers[v - 1]).join(', ');
        const userText = pickText(userArr as number[]);
        const correctArr = Array.isArray(meta.correctAnswer) ? meta.correctAnswer : [meta.correctAnswer];
        const correctText = pickText(correctArr as number[]);

        review.push(`
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
          ${review.join('')}
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

    model.onCurrentPageChanging.add(onNextAsSubmit);
    model.onAfterRenderQuestion.add(onAfterRenderQuestion);
    model.onComplete.add(onCompleteHandler);

    return () => {
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

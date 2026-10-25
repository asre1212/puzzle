import test from 'node:test';
import assert from 'node:assert/strict';
import {wordHint,outcome,statistics,newState,validateState,dailyAnswer} from '../dist/core.js';
import {createSudoku,createLadder,makeWordGraph} from '../dist/puzzles.js';
import {createSemantic,submitSemantic} from '../dist/semantic.js';
import {commonLadderWords} from '../dist/ladder-words.js';
import {answers,words} from '../dist/words.js';
const allowed=new Set([...answers,...words]);
test('Letter hints skip known green positions, preserve guesses and stop on finished puzzles',()=>{
 const g={answer:'apple',guesses:['ample'],draft:'cra'};
 assert.deepEqual(wordHint(g),{index:1,letter:'p'});
 assert.deepEqual(g.hintPositions,[1]);
 assert.equal(wordHint(g),null);
 assert.deepEqual(g.guesses,['ample']);assert.equal(g.draft,'cra');
 const repeated={answer:'apple',guesses:[]};
 for(let i=0;i<5;i++)assert.equal(wordHint(repeated).index,i);
 assert.equal(wordHint(repeated),null);
 for(const finished of [{answer:'apple',guesses:['apple']},{answer:'apple',guesses:[],revealed:true},{answer:'apple',guesses:Array(6).fill('other')}])assert.equal(wordHint(finished),null);
});
test('Revealing a daily answer does not create a win, streak or guess-distribution result',()=>{
 const date='2026-10-24',g={id:date,date,mode:'daily',answer:dailyAnswer(date,answers),guesses:[],revealed:true};
 assert.equal(outcome(g),'revealed');const stats=statistics({[date]:g},date);
 assert.equal(stats.played,1);assert.equal(stats.winRate,0);assert.equal(stats.streak,0);assert.deepEqual(stats.dist,[0,0,0,0,0,0]);
});
test('All puzzle reveals and hint progress survive backup and restore without rewriting user moves',()=>{
 const s=newState(),date='2026-10-24';s.daily[date]={id:date,date,mode:'daily',answer:dailyAnswer(date,answers),guesses:[],draft:'',hintPositions:[0,1],revealed:true};
 s.practice=[{id:'p1',date,mode:'practice',answer:answers[0],guesses:[],hintPositions:[2],revealed:true}];s.activePractice='p1';
 s.extras.sudoku.current={...createSudoku(42),revealed:true};s.extras.sudoku.current.notes[s.extras.sudoku.current.board.indexOf(0)]=[1,3];
 s.extras.ladder.current={...createLadder(42,makeWordGraph(commonLadderWords)),draft:'ca',revealed:true};
 const g=createSemantic('ocean','sem1');submitSemantic(g,'sea');g.hints=1;g.revealed=true;s.extras.semantic.current=g;
 assert.deepEqual(validateState(JSON.parse(JSON.stringify(s)),answers,allowed),s);
 for(const type of ['sudoku','ladder','semantic']){assert.equal(s.extras[type].history.length,0);assert.equal(s.extras[type].current.complete,false);}
 assert.throws(()=>submitSemantic(g,'ocean'));assert.equal(g.complete,false);
});
test('Legacy puzzle state stays valid; invalid reveal flags and hint indices are rejected',()=>{
 const s=newState();s.practice=[{id:'p',date:'2026-10-24',mode:'practice',answer:answers[0],guesses:[]}];s.activePractice='p';
 assert.deepEqual(validateState(s,answers,allowed),s);
 for(const patch of [{revealed:'yes'},{hintPositions:[-1]},{hintPositions:[5]},{hintPositions:[0,0]},{hintPositions:['<script>']},{revealed:true,guesses:[answers[0]]}]){const bad=structuredClone(s);Object.assign(bad.practice[0],patch);assert.throws(()=>validateState(bad,answers,allowed));}
 for(const type of ['sudoku','ladder','semantic']){const bad=structuredClone(s);bad.extras[type].current=type==='sudoku'?createSudoku(42):type==='ladder'?createLadder(42,makeWordGraph(commonLadderWords)):createSemantic('ocean','test');bad.extras[type].current.revealed='yes';assert.throws(()=>validateState(bad,answers,allowed));}
});

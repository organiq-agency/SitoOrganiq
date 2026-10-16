const assert = require('node:assert/strict');
const {questions, derive} = require('../js/checkup-model.js');
const base=[3,2,2,1,0,1,3,0];
// A chosen goal must change the recommended first action, not only the summary.
const goalTitles=questions[7].options.map((_,goal)=>{
 const answers=[...base];answers[7]=goal;
 return derive(answers).tips[0].title;
});
assert.equal(new Set(goalTitles).size,4);
// Expertise alone is not a reason to classify social media as secondary.
const expertise=[3,2,2,1,0,1,3,0];
assert.equal(derive(expertise).alternative,false);
const searchAndNoTime=[3,2,2,1,1,0,3,0];
assert.equal(derive(searchAndNoTime).alternative,true);
// The sector actually changes the content suggestion; free text is preserved.
const sectors=questions[0].options.map((_,business)=>derive([business,...base.slice(1)],{0:'Studio di architettura'}).tips[2].text);
assert.equal(new Set(sectors).size,6);
assert.match(sectors[5],/Studio di architettura/);
assert.throws(()=>derive([0]));
assert.throws(()=>derive([99,...base.slice(1)]));
let count=0;
function visit(answers){
 if(answers.length===questions.length){
  const result=derive(answers,{0:'Attività di prova'});
  assert.equal(result.tips.length,3);
  assert.equal(result.tips[0].label,'Il primo passo');
  assert.equal(result.summary.length,8);
  assert.equal(Object.hasOwn(result,'score'),false);
  assert.ok(result.tips.every(t=>t.title.length>0&&t.text.length>0));
  count++;return;
 }
 questions[answers.length].options.forEach((_,i)=>visit([...answers,i]));
}
visit([]);
console.log(`Check-up: ${count.toLocaleString('it-IT')} combinazioni valide; obiettivi, settori, percorso alternativo e validazione verificati.`);

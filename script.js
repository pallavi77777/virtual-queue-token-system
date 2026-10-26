const KEY="queueflow.tokens.v1";let tokens=load(),lastGenerated=null,timer;
const $=id=>document.getElementById(id);
function load(){try{return JSON.parse(localStorage.getItem(KEY)||"[]")}catch{return []}}
function save(){localStorage.setItem(KEY,JSON.stringify(tokens))}
function nextNum(){return tokens.reduce((m,t)=>Math.max(m,Number(t.id.slice(1))||0),0)+1}
function fmtTime(date){return new Date(date).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
function serving(){return tokens.find(t=>t.status==="serving")}
function waiting(){return tokens.filter(t=>t.status==="waiting")}
function toast(message){$("toast").textContent=message;$("toast").classList.add("show");clearTimeout(timer);timer=setTimeout(()=>$("toast").classList.remove("show"),2600)}
function render(){
 const active=serving(),wait=waiting();
 $("nowServing").textContent=active?active.id:"—";$("waitingCount").textContent=wait.length;$("totalIssued").textContent=tokens.length;$("nextToken").textContent=wait[0]?.id||"—";
 $("tableCount").textContent=tokens.length;$("queueSummary").textContent=`Showing ${tokens.length} token${tokens.length===1?"":"s"}`;$("previewNumber").textContent=lastGenerated||"Q—";
 if(!tokens.length){$("queueTable").innerHTML='<tr><td colspan="5" class="empty">No tokens yet. Generate a token to get started.</td></tr>';return}
 $("queueTable").innerHTML=[...tokens].reverse().map(t=>{
  const pos=t.status==="waiting"?`#${wait.findIndex(x=>x.id===t.id)+1}`:"—";
  let actions=t.status==="waiting"?`<button class="small-btn done" data-action="serve" data-id="${t.id}">Call</button><button class="small-btn skip" data-action="skip" data-id="${t.id}">Skip</button>`:t.status==="serving"?`<button class="small-btn done" data-action="complete" data-id="${t.id}">Complete</button><button class="small-btn skip" data-action="skip" data-id="${t.id}">Skip</button>`:"—";
  return `<tr><td class="token-cell">${t.id}</td><td>${fmtTime(t.createdAt)}</td><td><span class="badge ${t.status}">${t.status[0].toUpperCase()+t.status.slice(1)}</span></td><td>${pos}</td><td>${actions}</td></tr>`
 }).join("");
}
function issue(){const id="Q"+String(nextNum()).padStart(3,"0");tokens.push({id,status:"waiting",createdAt:new Date().toISOString()});lastGenerated=id;save();render();toast(`Token ${id} generated successfully.`)}
function callNext(){if(serving()){toast("Complete or skip the current token first.");return}const t=waiting()[0];if(!t){toast("There are no waiting tokens.");return}t.status="serving";save();render();toast(`${t.id} is now being served.`)}
function update(id,action){const t=tokens.find(x=>x.id===id);if(!t)return;if(action==="serve"){if(serving()){toast("Complete or skip the current token first.");return}t.status="serving";toast(`${id} is now being served.`)}else if(action==="complete"){t.status="completed";toast(`${id} marked completed.`)}else{t.status="skipped";toast(`${id} has been skipped.`)}save();render()}
$("generateToken").addEventListener("click",issue);$("callNext").addEventListener("click",callNext);
$("queueTable").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(b)update(b.dataset.id,b.dataset.action)});
$("statusForm").addEventListener("submit",e=>{e.preventDefault();const q=$("tokenSearch").value.trim().toUpperCase().replace(/\s/g,"");const t=tokens.find(x=>x.id===q);const box=$("statusResult");if(!t){box.innerHTML='<span class="result-icon">!</span><div><b>Token not found</b><p>Check the number and try again.</p></div>';return}let msg=t.status==="waiting"?`You are number ${waiting().findIndex(x=>x.id===t.id)+1} in the waiting queue.`:t.status==="serving"?"Please proceed to the service counter.":t.status==="completed"?"Your service has been completed.":"This token has been skipped. Please contact the service desk.";box.innerHTML=`<span class="result-icon">${t.status==="completed"?"✓":"◷"}</span><div><b>${t.id} · ${t.status[0].toUpperCase()+t.status.slice(1)}</b><p>${msg}</p></div>`});
$("resetQueue").addEventListener("click",()=>{if(!tokens.length){toast("The queue is already empty.");return}if(confirm("Reset the queue? All tokens saved in this browser will be removed.")){tokens=[];lastGenerated=null;save();render();$("statusResult").innerHTML='<span class="result-icon">⌕</span><div><b>Ready when you are</b><p>Enter your token number to see its status.</p></div>';toast("Queue has been reset.")}});
$("year").textContent=new Date().getFullYear();render();
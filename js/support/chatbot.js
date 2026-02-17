// Simple rule-based in-browser assistant for PrimeMar
(function(){
  const faq = [
    {q: "I can't login", a: "Try resetting your password from the Login page. If you use social sign-in, try clearing browser cookies and retry." , tags:["login"]},
    {q: "Withdrawal failed", a: "Check that your payout method is verified and that you have sufficient balance. If you see an error code, copy it and create a ticket." , tags:["withdrawals","payments"]},
    {q: "How to get verified", a: "Go to Settings → Verification and follow the steps. Ensure you have the required followers and payment ready." , tags:["verification"]},
    {q: "Change profile name", a: "Open Settings → Account and edit your Display Name. Username cannot be changed." , tags:["profile"]},
    {q: "How to boost", a: "Use the Boost feature on a Connect to increase visibility. Visit the Boost section on the post actions." , tags:["boost"]}
  ];

  function el(id){ return document.getElementById(id); }

  function addMessage(text, who){
    const container = el('chatMessages');
    const div = document.createElement('div'); div.className = 'msg '+who; div.textContent = text; container.appendChild(div); container.scrollTop = container.scrollHeight;
  }

  function findAnswer(input){
    const t = input.toLowerCase();
    // exact keyword match
    for (const f of faq){
      for (const tag of f.tags){ if (t.includes(tag)) return f.a; }
      if (f.q.toLowerCase().split(' ').some(w=> t.includes(w))) return f.a;
    }
    // fallback suggestions
    return null;
  }

  function suggestSteps(){
    return "I couldn't find an exact answer. Try: 1) Describe the error message 2) Provide screenshots (if possible) 3) Create a support ticket and we'll follow up.";
  }

  function createTicket(summary, details){
    const tickets = JSON.parse(localStorage.getItem('primemar_tickets')||'[]');
    const id = 'PM-'+Date.now().toString(36).slice(-6).toUpperCase();
    const ticket = { id, summary, details, status: 'open', createdAt: new Date().toISOString() };
    tickets.unshift(ticket); localStorage.setItem('primemar_tickets', JSON.stringify(tickets));
    return ticket;
  }

  function renderFAQ(){
    const ul = el('faqList'); if(!ul) return;
    ul.innerHTML = '';
    for(const f of faq){ const li=document.createElement('li'); li.textContent = f.q; li.addEventListener('click', ()=>{ addMessage(f.q,'user'); addMessage(f.a,'bot'); }); ul.appendChild(li); }
  }

  function renderTickets(){
    const list = el('ticketsList'); if(!list) return;
    const tickets = JSON.parse(localStorage.getItem('primemar_tickets')||'[]');
    if(tickets.length===0){ list.innerHTML = '<p>No tickets yet.</p>'; return; }
    list.innerHTML = tickets.map(t=>`<div class="card" style="margin-bottom:8px;padding:8px;"><strong>${t.id}</strong> — ${t.summary}<br><small>${t.createdAt}</small><div>Status: ${t.status}</div></div>`).join('');
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const chatForm = el('chatForm'); const chatInput = el('chatInput'); const createTicketBtn = el('createTicketBtn'); const viewTicketsBtn = el('viewTicketsBtn'); const ticketsModal = el('ticketsModal'); const closeTickets = el('closeTickets');
    renderFAQ();
    addMessage('Hello! I am PrimeMar Assistant. How can I help you today?','bot');

    chatForm && chatForm.addEventListener('submit', (e)=>{
      e.preventDefault(); const text = chatInput.value.trim(); if(!text) return; addMessage(text,'user'); chatInput.value = '';
      const ans = findAnswer(text);
      if(ans){ setTimeout(()=>addMessage(ans,'bot'), 300); }
      else { setTimeout(()=>addMessage(suggestSteps(),'bot'), 400); }
    });

    createTicketBtn && createTicketBtn.addEventListener('click', ()=>{
      const lastUser = Array.from(document.querySelectorAll('.msg.user')).pop();
      const summary = lastUser ? lastUser.textContent.slice(0,80) : 'User request via support page';
      const details = Array.from(document.querySelectorAll('.msg')).map(m=>m.textContent).join('\n');
      const ticket = createTicket(summary, details);
      addMessage(`Ticket created: ${ticket.id}. Our support team will review it.`, 'bot');
    });

    viewTicketsBtn && viewTicketsBtn.addEventListener('click', ()=>{ ticketsModal.classList.remove('hidden'); renderTickets(); });
    closeTickets && closeTickets.addEventListener('click', ()=>{ ticketsModal.classList.add('hidden'); });
  });
})();

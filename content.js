const ideaImgUrl=chrome.runtime.getURL("assets/images/idea.png");


const observer = new MutationObserver(handleRouteChange);
observer.observe(document.body, { childList: true, subtree: true });

let lastPath = location.pathname;
addAskDoubtBtn();   

function handleRouteChange() {
    if (location.pathname === lastPath) return; 
    lastPath = location.pathname;
    const aichatrem=document.getElementById("aiChatSection");
    if(aichatrem)aichatrem.remove();
    addAskDoubtBtn();  
}

function onProblemsPage(){
    return window.location.pathname.startsWith('/problems/');
}
function addAskDoubtBtn(){
    if(!onProblemsPage()||document.getElementById("askDoubtBtn-Ext")){
        const aichatrem=document.getElementById("aiChatSection");
        if(aichatrem)aichatrem.remove();
        return;
    }
    const aiChatsection=document.createElement("div");
    aiChatsection.classList.add("aiChatSection");
    aiChatsection.setAttribute("id","aiChatSection");
    aiChatsection.innerHTML=`
    <div class="askDoubtBtn-Ext" id="askDoubtBtn-Ext" style="width:120px;height:35px;background-color:#2b384e;border-radius:12px;display:flex;justify-content:space-evenly;align-items:center;font-family:sans-serif;">
        <img src="${ideaImgUrl}" alt="AI" style="width:20px;height:20px;">
        <span style="font-size:18px;color:white;">AI Help</span>
    </div>
    <div id="chatBoxContainer-ext" class="chatBoxContainer-ext"></div>
    `;
    const parentDiv=document.getElementsByClassName("coding_desc_container__gdB9M")[0];
    parentDiv.insertAdjacentElement("beforeend",aiChatsection);
    const doubtBtn=document.getElementById("askDoubtBtn-Ext");
    doubtBtn.addEventListener("click",onclickDoubtBtn);
}
async function onclickDoubtBtn(){
    const Questionkey=document.getElementsByClassName("coding_problem_info_heading__G9ueL")[0].textContent;
    const doubtBtn=document.getElementById("askDoubtBtn-Ext");
    doubtBtn.remove();
    const aiChatSection=document.getElementsByClassName("aiChatSection")[0];
    aiChatSection.style="width:100%;height:350px;background-color:#2b384e;border-radius:12px;display:flex;flex-direction:column;";
    const chatBoxContainer=document.getElementById("chatBoxContainer-ext");
    chatBoxContainer.innerHTML=`
        <div style="display:flex;flex-direction:column;flex:1;">
            <div class"ChatHeading-Ext" style="width:100%;background-color:#161d29;border-top-left-radius:12px;border-top-right-radius:12px;color:white;font-size:18px;padding:7px;text-align:center;">
                AI Doubt Helper
            </div>
            <div id="ChatBox-Ext" class="ChatBox-Ext" style="flex: 1;overflow-y: auto;border: 1px solid #4a4d52;color: white;padding: 15px;display: flex;flex-direction: column;gap: 10px; scroll-behavior: smooth; background-color: #36393f;border-radius: 12px 12px 0 0;">
            
            </div>
        </div>
        <div id="promtInputSection-ext" class="promptInputSection" style="">
        <div style="display: flex; gap: 10px; align-items: center;">
            <input id="chatInput-ext" type="text" placeholder="Ask your doubt..." 
                style="flex: 1; padding: 8px 12px; border-radius: 8px; border: 1px solid #ccc; font-size: 16px; outline none;">
            <button id="chatSubmit-ext" 
                style="padding: 8px 16px; border-radius: 8px; background-color: #2b384e; color: white;border: 2px solid white; font-size: 16px;">
                Send
            </button>
        </div>
        </div>
    `;
    chatBoxContainer.style="display: flex;height: 100%;flex-direction: column;";
    const chatBoxext=document.getElementById("ChatBox-Ext");
    const currDoubtResponses=await getCurrentDoubtResponses(Questionkey);
    currDoubtResponses.forEach(eachChat => {
        if(eachChat.sender==="user"){
            appendUserChat(chatBoxext,eachChat.message);
        }else{
            appendaiChat(chatBoxext,eachChat.message);
        }
    });
    document.getElementById("chatSubmit-ext").addEventListener("click", onChatSubmit);
}
async function onChatSubmit() {
    const Questionkey=document.getElementsByClassName("coding_problem_info_heading__G9ueL")[0].textContent;
    const inputValue = document.getElementById("chatInput-ext").value.trim();
    document.getElementById("chatInput-ext").value = "";
    if (inputValue === "") return;
    const userChatObj={
        sender:"user",
        message:inputValue
    }
    setChatToStorage(userChatObj,Questionkey);
    const chatBoxContainer=document.getElementById("ChatBox-Ext");
    appendUserChat(chatBoxContainer,inputValue);
    const probStatement=document.getElementsByClassName("coding_problem_info_heading__G9ueL")[0].textContent||"";
    const descriptionProb=document.getElementsByClassName("coding_desc_container__gdB9M")[0].children[0].children[1].textContent||"";
    const inputFormatProb=document.getElementsByClassName("coding_desc_container__gdB9M")[0].children[0].children[3].textContent||"";
    const outputFormatProb=document.getElementsByClassName("coding_desc_container__gdB9M")[0].children[0].children[5].textContent||"";
    const constraints=document.getElementsByClassName("coding_desc_container__gdB9M")[0].children[0].children[7].textContent||"";
    const sampleInput=document.getElementsByClassName("coding_desc_container__gdB9M")[0].children[0].children[8].children[0].children[0].children[1].textContent;
    const sampleOutput=document.getElementsByClassName("coding_desc_container__gdB9M")[0].children[0].children[8].children[0].children[2].children[1].textContent;
    
    const context=`Problem Statement:"${probStatement}"

    Description of Problem: ${descriptionProb}.
        
        Input Format:${inputFormatProb}
        Output Format:${outputFormatProb}
        Constraints:${constraints}

        Sample Input:${sampleInput}
        Sample Output:${sampleOutput}
        
        - Only one valid answer exists.
        ---
        **Accepted Concepts & Topics:**
        This bot can discuss topics directly related to competitive programming problems, including:
        - Algorithm design (e.g., brute force, hash maps, two-pointer, sorting, dynamic programming, greedy)
        - Data structures (e.g., arrays, linked lists, trees, graphs, hash tables, stacks, queues)
        - Time and space complexity analysis (Big O notation)
        - Problem-solving strategies (e.g., breaking down problems, edge cases, debugging)
        - Understanding input/output formats
        - Clarification on problem statements, constraints, or examples.
        - Common competitive programming patterns.`
    const textInput=`You are a competitive programming assistant.
                        Your purpose is to answer questions ONLY about the provided competitive coding problem description, its inputs, constraints, examples, or relevant coding concepts (algorithms, data structures, complexity).

                        **Here is the competitive programming problem context:**
                        ${context}
                        
                        ---
                        
                        **Instructions:**
                        1.  Analyze the user's question.
                        2.  If the user's question is *directly and strictly* related to the competitive programming problem (description, inputs, constraints, examples) or related coding concepts as listed above, provide a concise and adequate response.
                        3.  If the user's question is *not* related to competitive programming or the specific problem context, you **MUST respond ONLY with the exact phrase:** "Not related to competitive programming."
                        4.  Do NOT engage in general conversation, personal advice, or topics outside competitive programming.
                        
                        User question: "${inputValue}"`;
    const apiKey = "YOUR-APIKEY-GEMINI"; 
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const payload = {
        contents: [
            {
                parts: [
                    {
                        text: textInput
                    }
                ]
            }
        ]
    };

    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
        appendaiChat(chatBoxContainer,reply);
        const responseChatObj={
            sender:"ai",
            message:reply
        }
        setChatToStorage(responseChatObj,Questionkey);
    } catch (err) {
        console.error("API error:", err);
        const responseChat=document.createElement("div");
        responseChat.classList.add("responseChat-Ext");
        responseChat.style="background-color: #4a4d52;color: white;padding: 10px 15px;border-radius: 20px;max-width: 70%;align-self: flex-end;word-wrap: break-word;";
        const reply="Sorry an Error Occured!";
        appendaiChat(chatBoxContainer,reply);
        const responseChatObj={
            sender:"ai",
            message:reply
        }
        setChatToStorage(responseChatObj,Questionkey);
    }
    
}

function appendUserChat(chatBoxContainer,inputValue){
    const userChat=document.createElement("div");
    userChat.classList.add("userChat-ext");
    userChat.style="background-color: #007bff;color: white;padding: 10px 15px;border-radius: 20px;max-width: 70%;align-self: flex-start;  word-wrap: break-word;";
    userChat.innerHTML=`<p style="margin: 0;">${inputValue}</p>`;
    chatBoxContainer.appendChild(userChat);
}
function appendaiChat(chatBoxContainer,reply){
        const responseChat=document.createElement("div");
        responseChat.classList.add("responseChat-Ext");
        responseChat.style="background-color: #4a4d52;color: white;padding: 10px 15px;border-radius: 20px;max-width: 70%;align-self: flex-end;word-wrap: break-word;";
        responseChat.innerHTML=`
            <p style="margin: 0;">${reply}</p>
        `;
        chatBoxContainer.appendChild(responseChat);
}

async function setChatToStorage(chatobj,key){
    const allChats= await getCurrentDoubtResponses(key);
    allChats.push(chatobj);
    chrome.storage.local.set({[key]:allChats},()=>{
        console.log("Success in storing chat");
    })
}

//get chats corresponding to each question which would act like a key.
function getCurrentDoubtResponses(key){
    return new Promise((resolve,reject)=>{
        chrome.storage.local.get([key],(results)=>{
            console.log(results);
            resolve(results[key]||[]);
        })
    })
}
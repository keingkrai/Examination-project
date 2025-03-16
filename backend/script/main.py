import os
import asyncio
import json
import torch
import numpy as np
import ast
from flask import Flask, request, jsonify
from autogenstudio.teammanager import TeamManager
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core.models import ModelInfo, ModelFamily
from autogen_agentchat.agents import AssistantAgent, SocietyOfMindAgent
from autogen_agentchat.ui import Console
from autogen_agentchat.conditions import MaxMessageTermination, TextMentionTermination
from autogen_agentchat.messages import TextMessage
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.base import TaskResult



app = Flask(__name__)

async def get_detailexam(earnscore: int):
    return f"The score received: {earnscore}"

async def process_task(manager, team_config_path, task_text):
    try:
        with open(team_config_path, "r") as f:
            team_config = json.load(f)
        
        response = await manager.run(team_config=team_config_path, task=task_text)
        task_result = response.task_result
        messages = task_result.messages
        
        response_content = [
            {"source": msg.source, "content": msg.content if isinstance(msg.content, str) else str(msg.content)}
            for msg in messages
        ]
        
        return response_content
    except Exception as e:
        return [{"error": str(e)}]

@app.route("/autogenprocess", methods=["POST"])
async def autogen():
    
    model_client_deepseek_r1 = OpenAIChatCompletionClient(
        model="deepseek-r1-distill-llama-70b",
        base_url="https://api.groq.com/openai/v1",
        api_key="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",
        model_info=ModelInfo(
            vision=False,
            function_calling=True,
            json_output=False,
            family=ModelFamily.R1,
        )
    )
    
    model_client_llama = OpenAIChatCompletionClient(
        model="deepseek-r1-distill-qwen-32b",
        base_url="https://api.groq.com/openai/v1",
        api_key="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",
        model_info=ModelInfo(
            vision=False,
            function_calling=True,
            json_output=False,
            family=ModelFamily.R1,
        )
    )
    
    # Define the rubric-based scoring agent
    rubric_scoring_agent = AssistantAgent(
        name="rubric_scoring_agent",
        model_client=model_client_deepseek_r1,
        system_message="""
📌 **Subjective Exam Grading Task (Rubric-Based Assessment with Variable Total Score)**  

### **Question:**  
"What is the capital of Thailand?"  

- **Teacher’s Answer (Model Answer):** "Bangkok"  
- **Student’s Answer:** "Bangkok"  
- **Total Possible Score:** [X] Points (this may vary per question)  

### **📖 Grading Rubric (Proportional Scoring):**  
The answer is evaluated based on the following **four criteria**, where the weight of each category is calculated as a percentage of the total possible score:  

1️⃣ **Correctness (30% of total score)**  
   - Full marks: The answer is completely correct.  
   - Partial marks: The answer is mostly correct but has minor factual errors.  
   - No marks: The answer is incorrect or does not match the expected response.  

2️⃣ **Relevance (30% of total score)**  
   - Full marks: The answer is directly relevant to the question.  
   - Partial marks: The answer is mostly relevant but includes unnecessary or off-topic details.  
   - No marks: The answer is not relevant to the question.  

3️⃣ **Logical Reasoning (10% of total score)**  
   - Full marks: The answer demonstrates clear logical reasoning.  
   - No marks: The answer lacks logical coherence or contradicts itself.  

4️⃣ **Keywords (30% of total score)**  
   - **Full marks:** The answer contains all or most of the key terms from the model answer.  
   - **Partial marks:** The answer contains some key terms but misses others, or uses them incorrectly.  
   - **No marks:** The answer does not contain any of the key terms.  
   - **Note:** **The keyword evaluation is based purely on similarity to the expected key terms, without considering relevance to the question.**  

---  

✍️ **Instructions for AI:**  
1️⃣ **Evaluate the student's answer based on the rubric criteria (Correctness, Relevance, Logical Reasoning) and Keywords using proportional scoring.**  
2️⃣ **Calculate the final score dynamically based on the total possible score [X] for the question.**  
3️⃣ **Provide a detailed step-by-step justification for each score assigned.**  
4️⃣ **If full marks are awarded, clearly explain why each criterion and the keywords were met at the highest standard.**  
5️⃣ **If points are deducted, explain which criteria or keywords were not fully met and why.**  
6️⃣ **Format your response clearly, using a structured breakdown of the rubric criteria.**  
"""


    )
    
    # Define the translator agent for translating the score into Thai
    translator_agent = AssistantAgent(
        name="translator",
        model_client=model_client_llama,
        system_message="""Translate the evaluation into Thai. The translation **must include** details from both 'rubric scoring' and 'Score'. Do not omit or summarize any part."""
    )
    
    assignscore_agent = AssistantAgent(
        name="assignscore_agent",
        model_client=model_client_llama,
        system_message="""Your tesk is Assignscore. Do not change everthink.""",
        tools=[get_detailexam]
    )
    
    team = RoundRobinGroupChat(
        participants=[rubric_scoring_agent, translator_agent, assignscore_agent],
        max_turns=3,
    )

    try:
        data = request.get_json()
        teacher_questions = data.get("teacher_question", [])
        teacher_answers = data.get("teacher_answer", [])
        student_answers = data.get("student_answer", [])
        maxscores = data.get("maxscore", [])
        keyword = data.get("keyword", [])
        room_id = data.get("room_id", "")
        
        print("agent assign score active")
        print(student_answers)
        
        if isinstance(teacher_questions, str):
            teacher_questions = [teacher_questions]
        if isinstance(teacher_answers, str):
            teacher_answers = [teacher_answers]
        if isinstance(student_answers, str):
            student_answers = [student_answers]
        if isinstance(maxscores, str):
            maxscores = [maxscores]
        if isinstance(keyword, str):
            keyword = ast.literal_eval(keyword)
        print(len(keyword))



        print(keyword[1])
        if len(teacher_questions) != len(teacher_answers) or len(teacher_questions) != len(student_answers) or len(teacher_questions) != len(maxscores) or len(teacher_questions) != len(keyword):
            return jsonify({"error": "Mismatched input lengths."}), 400
        
        
        if os.path.exists(f"./state/stateroom_{room_id}.json"):
            with open(f"./state/stateroom_{room_id}.json", "r") as f:
                state = json.load(f)
                await rubric_scoring_agent.load_state(state)
        
        
        response_contents = []
        
        for i in range(len(teacher_questions)):
            if not student_answers[i].strip():  # ตรวจสอบว่าคำตอบของนักเรียนว่างเปล่า
                response_contents.append({
                    "source": "translator",
                    "content": ""  # หรือ None ตามที่ต้องการ
                })
                continue  # ข้ามการคำนวณ
            
            task_text = ("จากข้อสอบอัตนัย:\n"
                    f"โจทย์: {teacher_questions[i]}\n"
                    f"คำตอบของอาจารย์: {teacher_answers[i]}\n"
                    f"คำตอบของนักเรียน: {student_answers[i]}\n"
                    f"คะแนนเต็ม: {maxscores[i]}\n"
                    f"คำสำคัญ: {keyword[i]}\n"
                    "ให้คะแนนโดยตรวจสอบทั้ง คำถาม คำตอบอาจารย์ คำตอบของนักเรียน และ คำสำคัญ"
            )
            
            stream = team.run_stream(task=task_text)
            
            async for message in stream:
                if hasattr(message, 'content'):
                    response_contents.append({
                        "source": message.source,
                        "content": message.content if isinstance(message.content, str) else str(message.content)
                    })
                else:
                    response_contents.append(str(message))  # Capture any non-content messages
                    
            see = json.dumps(response_contents, indent=4, ensure_ascii=False)
                    
            print(see)
            
        
        return jsonify({"model_results": response_contents})
    except Exception as e:
        return jsonify({"error": str(e)})

@app.route("/autogenprocessfeedback", methods=["POST"])
async def autogen_feedback():
    
    model_client_deepseek_r1 = OpenAIChatCompletionClient(
        model="deepseek-r1-distill-llama-70b",
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ['GROQ_API_KEY'],
        model_info=ModelInfo(
            vision=False,
            function_calling=True,
            json_output=False,
            family=ModelFamily.R1,
        )
    )
    
    model_client_llama = OpenAIChatCompletionClient(
        model="llama-3.2-90b-vision-preview",
        base_url="https://api.groq.com/openai/v1",
        api_key=os.environ['GROQ_API_KEY'],
        model_info=ModelInfo(
            vision=False,
            function_calling=True,
            json_output=False,
            family=ModelFamily.UNKNOWN,
        )
    )

    score_and_solution_agent = AssistantAgent(
    name="score_and_solution_checker",
    model_client=model_client_deepseek_r1,
    system_message="""
    You are an exam grader responsible for evaluating students' answers.
    
    **Task 1: Justify the given score**  
    - Explain why the answer received its score based on the following criteria:  
      1. Accuracy  
      2. Completeness  
      3. Logical reasoning  
    - Keep it concise (2-3 sentences).  

    **Task 2: Suggest improvements**  
    - Identify key weaknesses that caused score deductions.  
    - Provide clear, actionable suggestions to improve the answer.  

    Do **not** modify the assigned score. Avoid using quotation marks ("") or commas (,).
    """,
    )

    
    
    transltor_agent = AssistantAgent(
        name="translator",
        model_client=model_client_llama,
        system_message="""
        You are a professional translator and editor responsible for translating and refining the feedback into Thai.

        **Your task**:  
        1. Must translate all content into **natural and easy-to-understand Thai**.  
        2. Ensure the explanation is **clear, logical, and maintains its original meaning**.  
        3. Do not modify the reasoning or add unnecessary details.  
        4. Avoid using complex or unnatural vocabulary.  

        Do not use quotation marks ("") or commas (,).  
        """,
        reflect_on_tool_use=True,
    )

        
    team = RoundRobinGroupChat(
        participants=[score_and_solution_agent, transltor_agent],
        max_turns=2
    )
    
    try:
        data = request.get_json()
        teacher_questions = data.get("question", [])
        teacher_answers = data.get("answer_teacher", [])
        student_answers = data.get("answer_student", [])
        teacher_scores = data.get("score_ai", [])
        room_id = data.get("room_id", "")
        
        print("agent assign reason for teacher score active")
        print(teacher_scores)
        
        if isinstance(teacher_questions, str):
            teacher_questions = [teacher_questions]
        if isinstance(teacher_answers, str):
            teacher_answers = [teacher_answers]
        if isinstance(student_answers, str):
            student_answers = [student_answers]
        if isinstance(teacher_scores, str):
            teacher_scores = [teacher_scores]
        
        if len(teacher_questions) != len(teacher_answers) or len(teacher_questions) != len(student_answers) or len(teacher_questions) != len(teacher_scores):
            return jsonify({"error": "Mismatched input lengths."}), 400
        
        response_contents = []
        
        for i in range(len(teacher_questions)):
            if not student_answers[i].strip():  # ตรวจสอบว่าคำตอบของนักเรียนว่างเปล่า
                response_contents.append({
                    "source": "translator",
                    "content": ""  # หรือ None ตามที่ต้องการ
                })
                print("คำตอบของนักเรียนว่างเปล่า", response_contents)
                continue  # ข้ามการคำนวณ
            
            task_text = (
                f"จากโจทย์ ({teacher_questions[i]}) และมีคำตอบของอาจารย์ ({teacher_answers[i]}) "
                f"คำตอบของนักเรียน ({student_answers[i]}) คะแนนที่อาจารย์มอบให้นักเรียนคือ ({teacher_scores[i]}) "
                f"จงอธิบายเหตุผลของคะแนนที่ให้"
            )
            
            stream = team.run_stream(task=task_text)
            
            async for message in stream:
                if hasattr(message, 'content'):
                    response_contents.append({
                        "source": message.source,
                        "content": message.content if isinstance(message.content, str) else str(message.content)
                    })
                else:
                    response_contents.append(str(message))  # Capture any non-content messages
                    
            see = json.dumps(response_contents, indent=4, ensure_ascii=False)
                    
            print(see)
            
        
        return jsonify({"model_results": response_contents})
    except Exception as e:
        return jsonify({"error": str(e)})
    

if __name__ == "__main__":
    import asyncio
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    app.run(debug=True)

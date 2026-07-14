const Submission =
require("../models/Submission");

const Evaluation =
require("../models/Evaluation");

const Task =
require("../models/Task");

const {
 readFileContent
} = require(
 "../services/file.service"
);

const {
 evaluateSubmission
} = require(
 "../services/openrouter.service"
);

const evaluateSubmissionController =
async (req,res)=>{

 try{

  const { submissionId } =
   req.params;

  const submission =
   await Submission.findById(
    submissionId
   );

  if(!submission){

   return res.status(404)
   .json({
    success:false,
    message:
    "Submission not found"
   });

  }

  const task =
   await Task.findById(
    submission.taskId
   );

  if(!task){

   return res.status(404)
   .json({
    success:false,
    message:
    "Task not found"
   });

  }

  const code =
   readFileContent(
    submission.filePath
   );

  const aiResponse =
   await evaluateSubmission(

    `
    Task:
    ${task.title}

    Instructions:
    ${task.instructions}

    Expected Output:
    ${task.expectedOutput}

    Evaluation Criteria:
    ${task.evaluationCriteria}
    `,

    code

   );

  let parsed;

  try{

   parsed =
   JSON.parse(aiResponse);

  }catch{

   return res.status(500)
   .json({

    success:false,

    message:
    "AI returned invalid JSON",

    raw:aiResponse

   });

  }

  const evaluation =
   await Evaluation.create({

    submissionId:
    submission._id,

    score:
    parsed.score,

    strengths:
    parsed.strengths,

    mistakes:
    parsed.mistakes,

    feedback:
    parsed.feedback,

    aiModel:
    "deepseek"

   });

  submission.score =
   parsed.score;

  submission.feedback =
   parsed.feedback;

  submission.status =
   "evaluated";

  await submission.save();

  return res.json({

   success:true,

   evaluation

  });

 }catch(error){

  console.error(error);

  return res.status(500)
  .json({

   success:false,

   message:error.message

  });

 }

};

module.exports = {
 evaluateSubmissionController
};
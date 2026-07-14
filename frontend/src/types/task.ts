export interface Task {
  _id: string;

  title: string;

  instructions: string;

  starterCode: string;

  expectedOutput: string;

  evaluationCriteria: string;
}
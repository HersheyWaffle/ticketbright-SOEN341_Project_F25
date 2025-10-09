import { Parser } from "json2csv";

export const generateCSV = (data) => {
  try {
    const parser = new Parser();
    return parser.parse(data);
  } catch (err) {
    console.error("CSV generation error:", err);
    throw err;
  }
};
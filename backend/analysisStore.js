const TEMP_USER_ID = "test-user";

let analyses = [];

function saveAnalysis(record) {
  analyses.push(record);
  return record;
}

function getAnalysesByUserId(userId) {
  return analyses.filter((entry) => entry.userId === userId);
}

module.exports = {
  TEMP_USER_ID,
  saveAnalysis,
  getAnalysesByUserId,
};

const db = wx.cloud.database();
const MAX_LIMIT = 20;

async function getCollectionData(collectionName) {
  // 先取出集合记录总数
  const countResult = await db.collection(collectionName).count();
  console.log(countResult, '总数');
  const total = countResult.total;

  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT);

  // 承载所有读操作的 promise 的数组
  const tasks = [];
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(collectionName).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get();
    tasks.push(promise);
  }

  // 等待所有
  const results = await Promise.all(tasks);

  // 合并所有结果
  return results.reduce((acc, cur) => {
    console.log(acc, cur, '1233');
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    };
  }, { data: [], errMsg: '' });
}

exports.getMathBaseData = async (event, context) => {
  return await getCollectionData('math2');
};

exports.getHighMathData = async (event, context) => {
  return await getCollectionData('highMath');
};

exports.getXdData = async (event, context) => {
  return await getCollectionData('xdMath');
};

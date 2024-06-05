const db = wx.cloud.database();
const MAX_LIMIT = 20
exports.getMath2Data = async (event, context) => {
  // 先取出集合记录总数
  const countResult = await db.collection('math2').count()
  console.log(countResult,'总数')
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 20)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('math2').skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }
  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    console.log(acc,cur,'1233')
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}

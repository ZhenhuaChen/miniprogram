const db = wx.cloud.database();
const MAX_LIMIT = 20;

async function getCollectionData(collectionName, options = {}) {
  const { onlyfavorite = false, type } = options; // 从 options 中获取 onlyfavorite 参数

  // 先取出集合记录总数
  const countResult = await db.collection(collectionName).count();
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
  const allData = results.reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    };
  }, { data: [], errMsg: "" });

  // 如果 onlyfavorite 为 true，则过滤数据
  if (onlyfavorite) {
    const favoriteIds = wx.getStorageSync("favoriteIds") || []; // 获取本地存储中的 favoriteIds
    const filteredData = allData.data.filter((item) => favoriteIds.includes(item._id));
    return {
      data: filteredData,
      errMsg: '收藏数据',
    };
  }
  if(type) {
    const filteredData = allData.data.filter((item) => item?.type == type);
    return {
      data: filteredData,
      errMsg: '分章节数据',
    }
  }

  // 否则返回全部数据
  return allData;
}

exports.getMathBaseData = async (onlyfavorite, type) => {
  return await getCollectionData('math2', {'onlyfavorite': onlyfavorite, type: type});
};

exports.getComputerData = async (type) => {
  return await getCollectionData(type);
}

exports.getXianDaiData = async (onlyfavorite, type) => {
  return await getCollectionData('xiandai', {'onlyfavorite': onlyfavorite, type: type});
}

exports.getGailvlunData = async (onlyfavorite) => {
  return await getCollectionData('gailvlun', {'onlyfavorite': onlyfavorite});
}

exports.getCombinedFavoriteData = async () => {
  const favoriteIds = wx.getStorageSync("favoriteIds") || [];
  
  if (favoriteIds.length === 0) {
    return { data: [], errMsg: '没有收藏数据' };
  }

  try {
    // 获取高数收藏数据
    const mathResult = await getCollectionData('math2', { onlyfavorite: true });
    // 获取线代收藏数据  
    const xiandaiResult = await getCollectionData('xiandai', { onlyfavorite: true });
    // 获取概率论收藏数据
    const gailvlunResult = await getCollectionData('gailvlun', { onlyfavorite: true });
    
    // 合并数据并添加类型标识
    const combinedData = [
      ...mathResult.data.map(item => ({ ...item, subject: 'math', subjectName: '高数' })),
      ...xiandaiResult.data.map(item => ({ ...item, subject: 'xiandai', subjectName: '线代' })),
      ...gailvlunResult.data.map(item => ({ ...item, subject: 'gailvlun', subjectName: '概率论' }))
    ];
    
    // 随机打乱数组顺序，让高数、线代和概率论的题目交替出现
    const shuffledData = combinedData.sort(() => Math.random() - 0.5);
    
    return {
      data: shuffledData,
      errMsg: `合并收藏数据，共${shuffledData.length}道题目`
    };
  } catch (error) {
    console.error('获取合并收藏数据失败:', error);
    return { data: [], errMsg: '获取数据失败' };
  }
}
/**
 * @param {String} obj
 * @description 要克隆的对象
 */
export const shallowCopy = obj => {
  if (typeof obj !== "object") {
    return;
  }
  var newObj = obj instanceof Array ? [] : {};
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
}

/**
 * 生成推荐选择的课程封面list
 */
export const courseCoverList = () => {
  let arr = [];
  for (let i = 10001; i <= 10031; i++) {
    arr.push({url:`http://image.m-clinical.cn/m-elms/${i}.jpg_cover`,id:i})
  }
  return arr;
}

/**
 * @param {String} name 文件名
 * 阿里云课程封面存储地址
 */
export const ossImageUrl = (name) => {
  return `http://image.m-clinical.cn/m-elms/${name}.jpg_cover`
}

//生成26个英文字母
export const getEN = () => {
  let str = [];
  for (var i = 65; i < 91; i++) {
    str.push(String.fromCharCode(i));
  }
  return str;
}
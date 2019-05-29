
/**
 * vue plugin
 */
export default function (vm) {
  vm.$getCache = getCache
  vm.$setCache = setCache
  vm.$removeCache = removeCache
}


/**
 * @method  setCache  缓存一个数据
 *
 * @param   {String}  key           缓存的key名称
 * @param   {*}       data          缓存的数据
 * @param   {Number}  cache_time    过期时间(单位ms)，默认0（永不过期）
 *
 * @return  {Promise|Null}   resolve:缓存结果
 */
export function setCache(key, data, cache_time = 0) {
  return new Promise((resolve, reject) => {
    if (data === undefined)
      reject({msg: `setCache '${key}' err! data is undefined`});
    let now = new Date();
    let val = {
      time: cache_time === 0 ? 0 : +now + cache_time,
      data
    };
    val = JSON.stringify(val)
    localStorage.setItem(key,val);
    resolve();
  })
}

/**
 * @method  getCache  获取缓存的数据
 *
 * @param   {String}  key   缓存的key名称
 *
 * @return  {Promise}       resolve:缓存的数据或者null
 */
export function getCache(key) {
  return new Promise((resolve, reject) => {
    let val = localStorage.getItem(key);
    if (!val) {
      resolve(null);
      return;
    }
    try {
      val = JSON.parse(val);
      if (typeof val === 'string') {
        resolve(val);
        return;
      }
    } catch (e) {
      resolve(val)
      return;
    }

    let now = new Date();
    if (val.time === 0)
      resolve(val.data);
    else if (val && val.time - now > 0)
      resolve(val.data);
    else {
      localStorage.removeItem(key)
      resolve(null);
    }
  })
}

/**
 * @method  removeCache  移除缓存
 *
 * @param   {String}  key    缓存的key名称
 *
 * @return  {Promise|Null}   resolve:移除结果
 */
export function removeCache(key) {
  return new Promise((resolve, reject) => {
    localStorage.removeItem(key)
    resolve();
  })
}

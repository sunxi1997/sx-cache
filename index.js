/**
 * vue plugin
 */
export default function (vm) {
   vm.$getCache = getCache
   vm.$setCache = setCache
   vm.$removeCache = removeCache
}

// 缓存的keys
const CACHE_KEY = 'SX-CACHE-KEY';
let cacheKeys = getCacheKeys();

initTimers();

/**
 * @method  setCache  缓存一个数据
 *
 * @param   {String}  key           缓存的key名称
 * @param   {*}       data          缓存的数据
 * @param   {Number}  cache_time    过期时间(单位ms)，默认0（永不过期）
 *
 * @return  {*}   缓存结果
 */
export function setCache(key, data, cache_time = 0) {
   if (data === undefined)
      return {msg: `setCache '${key}' err! data is undefined`};

   if (isNaN(cache_time) || cache_time < 0) {
      console.warn(`setCache:${key} 警告, cache_time非法,已重置为0`);
      cache_time = 0;
   }

   let now = new Date();
   let val = {
      time: cache_time === 0 ? 0 : +now + cache_time,
      data
   };
   try {
      val = JSON.stringify(val);
   } catch (err) {
      console.warn(`setCache:${key} 警告, data格式非法,已重置为${data.toString()}`, err);
      val = val.toString();
   }
   localStorage.setItem(key, val);
   addCacheKey(key, cache_time);
}

/**
 * @method  getCache  获取缓存的数据
 *
 * @param   {String}  key   缓存的key名称
 *
 * @return  {*}       缓存的数据或者null
 */
export function getCache(key) {
   let val = localStorage.getItem(key);
   if (!val)
      return null;

   try {
      val = JSON.parse(val);
      if (typeof val === 'string')
         return val;
   } catch (e) {
      return val;
   }

   return cacheKeys[key] ? val.data : val;
}

/**
 * @method  removeCache  移除缓存
 *
 * @param   {String}  key    缓存的key名称
 *
 * @return  {*}   移除结果
 */
export function removeCache(key) {
   localStorage.removeItem(key)
}


// 缓存历史缓存的keys
function getCacheKeys() {
   let cacheKeys = localStorage.getItem(CACHE_KEY);
   if (!cacheKeys) return {};
   try {
      cacheKeys = JSON.parse(cacheKeys)
   } catch (e) {
      return {};
   }

   return typeof cacheKeys === 'object' ? cacheKeys : {}
}

// 同步当前keys到storage
function syncCacheKeys() {
   localStorage.setItem(CACHE_KEY, JSON.stringify(cacheKeys))
}

// 初始化keys中的过期清除
function initTimers() {
   let keys = Object.keys(cacheKeys);
   let now = +new Date();
   keys.forEach(key => {
      let cacheKey = cacheKeys[key];
      let {cache_time, now: time, timer} = cacheKey;
      time = time + cache_time - now;
      removeCacheKey(key, time)
   });
   syncCacheKeys();
}

// 新建了一个缓存
function addCacheKey(key, cache_time) {
   if (key === CACHE_KEY) return;

   let now = +new Date();

   if (cache_time !== 0) {
      let cacheKey = cacheKeys[key];
      cacheKey && clearTimeout(cacheKey.timer)
      // 定时清除缓存
      let timer = removeCacheKey(key, cache_time);
      cacheKeys[key] = {cache_time, now, timer}
   }
   syncCacheKeys();
}

function removeCacheKey(key, time = 0) {
   if (time <= 0) {
      delete cacheKeys[key];
      removeCache(key);
      syncCacheKeys();
      return true;
   }
   return setTimeout(() => removeCacheKey(key), time);
}

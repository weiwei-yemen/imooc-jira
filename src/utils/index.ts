import { useEffect, useRef, useState } from "react";

export const isFalsy = (value: unknown) => (value === 0 ? false : !value);

export const isVoid = (value: unknown) =>
  value === undefined || value === null || value === "";

// let a: object
// a = {name: 'jack'}
// a = () => {
// }
// a = new RegExp('')
//
// let b: { [key: string]: unknown }
// b = {name: 'Jack'}
// b = () => {}
// 在一个函数里，改变传入的对象本身是不好的
export const cleanObject = (object?: { [key: string]: unknown }) => {
  // Object.assign({}, object)
  if (!object) {
    return {};
  }
  const result = { ...object };
  Object.keys(result).forEach((key) => {
    const value = result[key];
    if (isVoid(value)) {
      delete result[key];
    }
  });
  return result;
};

export const useMount = (callback: () => void) => {
  useEffect(() => {
    callback();
  }, [callback]);
};

// const debounce = (func, delay) => {
//   let timeout;
//   return (...param) => {
//     if (timeout) {
//       clearTimeout(timeout);
//     }
//     timeout = setTimeout(function() {
//       func(...param);
//     }, delay);
//   }
// }
// const log = debounce(() => console.log('call'), 5000)
// log()
// log()
// log()
//   ...5s
// 执行！

// debounce 原理讲解：
// 0s ---------> 1s ---------> 2s --------> ...
//     一定要理解：这三个函数都是同步操作，所以它们都是在 0~1s 这个时间段内瞬间完成的；
//     log()#1 // timeout#1
//     log()#2 // 发现 timeout#1！取消之，然后设置timeout#2
//     log()#3 // 发现 timeout#2! 取消之，然后设置timeout#3
//             // 所以，log()#3 结束后，就只剩timeout#3在独自等待了

// 后面用泛型来规范类型
export const useDebounce = <V>(value: V, delay?: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // 每次在value变化以后，设置一个定时器
    const timeout = setTimeout(() => setDebouncedValue(value), delay);
    // 返回的一个函数，这个函数在每次在上一个useEffect处理完以后再运行
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};

// 这是一个 React 自定义 Hook，用于管理数组状态
export const useArray = <T>(initialArray: T[]) => {
  const [value, setValue] = useState(initialArray);
  return {
    value,
    setValue,
    add: (item: T) => setValue([...value, item]),
    clear: () => setValue([]),
    removeIndex: (index: number) => {
      const copy = [...value];
      /*
        copy.splice(index, 1) 的作用：
        - 从数组 copy 中删除索引为 index 的元素
        - 参数 1 表示删除 1 个元素
        - 会直接修改原数组，不返回新数组      
      */
      copy.splice(index, 1);
      setValue(copy);
    },
  };
};

/*
  1. document 是浏览器提供的全局对象，表示当前还在浏览的 HTML 页面
  2. document.title 是 HTML 页面中的一个属性，表示当前页面的标题
  3. useEffect 是 React 提供的一个 Hook，用于在组件挂载和卸载时执行副作用
  4. useEffect 的第一个参数是一个函数，这个函数会在组件挂载和卸载时执行
  5. useEffect 的第二个参数是一个数组，这个数组中的值是依赖项，当依赖项发生变化时，useEffect 的第一个参数会重新执行
  6. useEffect 的返回值是一个函数，这个函数会在组件卸载时执行
*/
export const useDocumentTitle = (title: string, keepOnUnmount = true) => {
  // useRef 可以保证其中的值在组件的整个生命周期中都保持不变
  const oldTitle = useRef(document.title).current;



  // react 组件设计哲学：在组件中，所有的副作用都应该放在 useEffect 中
  useEffect(() => {
    // 渲染完成后才会执行此副作用（react 的渲染是可以中断的）
    document.title = title;
  }, [title]);

  // 返回的清理函数在组件卸载时执行、依赖项发生变化时执行（先执行清理，再重新执行）
  useEffect(() => {
    return () => {
      if (!keepOnUnmount) {
        // 如果不指定依赖，读到的就是旧title
        document.title = oldTitle;
      }
    };
  }, [keepOnUnmount, oldTitle]);
};

export const resetRoute = () => (window.location.href = window.location.origin);

/**
 * 传入一个对象，和键集合，返回对应的对象中的键值对
 * @param obj
 * @param keys
 */
export const subset = <
  O extends { [key in string]: unknown },
  K extends keyof O
>(
  obj: O,
  keys: K[]
) => {
  const filteredEntries = Object.entries(obj).filter(([key]) =>
    keys.includes(key as K)
  );
  return Object.fromEntries(filteredEntries) as Pick<O, K>;
};

/**
 * 返回组件的挂载状态，如果还没挂载或者已经卸载，返回false；反之，返回true
 */
export const useMountedRef = () => {
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  });

  return mountedRef;
};

export default function (data) {
  let result;
  const processedIds = [];

  const createArrayForParent = (parentId) => {
    const parent = data.find(item => item.id === parentId);

    if (parent && parent.childs && parent.childs.length > 0) {
      const childrenIds = parent.childs;
      const childrenArrays = [];

      childrenIds.forEach(childId => {
        if (!processedIds.includes(childId)) {
          const grandchildrenArray = createArrayForParent(childId);
          childrenArrays.push(grandchildrenArray);
          processedIds.push(childId);
        }
      });
  
      return [parent, ...(childrenArrays.length === 1 ? childrenArrays[0] : [childrenArrays])];
    }
    else {
      return [parent];
    }
  };

  data.forEach(item => {
    if (!item.parentId && !processedIds.includes(item.id)) {
      const childrenArray = createArrayForParent(item.id);
      result = childrenArray;
      processedIds.push(item.id);
    }
  });

  return result;
}
export const stateStore = (tablePropsInit, optionKey) =>
(
    {
        ...tablePropsInit,
        ...JSON.parse(localStorage.getItem(optionKey) || "0"),
    }

)

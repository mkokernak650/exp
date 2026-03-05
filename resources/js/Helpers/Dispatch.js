export const dispatch = (action, changeTableProps, OPTION_KEY) => {
    changeTableProps((prevState) => {
        const newState = { ...prevState };
        const { data, ...settingsWithoutData } = newState;
        localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData));
        return newState;
    });
};

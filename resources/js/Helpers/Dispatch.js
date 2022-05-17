import { kaReducer } from "ka-table";


export const dispatch = (action, changeTableProps, OPTION_KEY) => {
    changeTableProps((prevState) => {
        const newState = kaReducer(prevState, action);
        const { data, ...settingsWithoutData } = newState;
        localStorage.setItem(OPTION_KEY, JSON.stringify(settingsWithoutData));
        return newState;
    });
};

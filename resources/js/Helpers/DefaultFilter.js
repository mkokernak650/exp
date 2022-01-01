export const defaultFilter = ($groupName, $field, $operator) => ({
    groupName: $groupName,
    items: [
        {
            field: $field,
            operator: $operator,
        },
    ],
})
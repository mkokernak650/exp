export const defaultFilter = ($groupName, $field, $operator,$dataType,$fkey,$value) => {
     const filter =
    {
        groupName: $groupName,
        items: [
            {
                field: $field,
                operator: $operator,
                value: $value,
                dataType: $dataType,
                fkey: $fkey,
            },
        ],
    }
    return filter
}
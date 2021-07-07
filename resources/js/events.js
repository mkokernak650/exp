const events = [
    {
        "name": "IVRNodeEnter",
        "weigth": 500,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:14:51.8397761Z",
                "formattedValue": 1625516091839,
                "type": "date",
                "sum": false
            },
            {
                "name": "NodeType",
                "original": "EnrichNode",
                "formattedValue": "EnrichNode",
                "type": "string",
                "sum": false
            },
            {
                "name": "stepName",
                "original": "Profile",
                "formattedValue": "Profile",
                "type": "string",
                "sum": false
            }
        ]
    },
    {
        "name": "DataEnrichment",
        "weigth": 500,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:14:53.3710348Z",
                "formattedValue": 1625516093371,
                "type": "date",
                "sum": false
            },
            {
                "name": "success",
                "original": "yes",
                "formattedValue": "yes",
                "type": "string",
                "sum": false
            },
            {
                "name": "errorMessage",
                "original": "",
                "formattedValue": "",
                "type": "string",
                "sum": false
            },
            {
                "name": "cost",
                "original": 0.12,
                "formattedValue": 0.12,
                "type": "currency",
                "sum": false
            }
        ]
    },
    {
        "name": "IVRNodeExit",
        "weigth": 500,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:14:53.3710348Z",
                "formattedValue": 1625516093371,
                "type": "date",
                "sum": false
            },
            {
                "name": "NodeType",
                "original": "EnrichNode",
                "formattedValue": "EnrichNode",
                "type": "string",
                "sum": false
            },
            {
                "name": "stepName",
                "original": "Profile",
                "formattedValue": "Profile",
                "type": "string",
                "sum": false
            }
        ]
    },
    {
        "name": "IVRNodeEnter",
        "weigth": 500,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:14:53.3710348Z",
                "formattedValue": 1625516093371,
                "type": "date",
                "sum": false
            },
            {
                "name": "NodeType",
                "original": "DialNode",
                "formattedValue": "DialNode",
                "type": "string",
                "sum": false
            },
            {
                "name": "stepName",
                "original": "On Success: Dial",
                "formattedValue": "On Success: Dial",
                "type": "string",
                "sum": false
            }
        ]
    },
    {
        "name": "CallPlanDetail",
        "weigth": 800,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:14:53.3866595Z",
                "formattedValue": 1625516093386,
                "type": "date",
                "sum": false
            },
            {
                "name": "IneligibleTargets",
                "original": "Legacy Health-Charter[1,1] TagFail\r\nSpectrum Reach - Cash[1,1] TagFail\r\nLegacy Health-AMC[1,1] TagFail\r\nLegacy Health-Misc.[1,1] TagFail",
                "formattedValue": "Legacy Health-Charter[1,1] TagFail\r\nSpectrum Reach - Cash[1,1] TagFail\r\nLegacy Health-AMC[1,1] TagFail\r\nLegacy Health-Misc.[1,1] TagFail",
                "type": "list",
                "sum": false
            },
            {
                "name": "EligibleTargets",
                "original": "Legacy Healing -Revshare[1,1]",
                "formattedValue": "Legacy Healing -Revshare[1,1]",
                "type": "list",
                "sum": false
            }
        ]
    },
    {
        "name": "TargetDialed",
        "weigth": 410,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:14:53.4022782Z",
                "formattedValue": 1625516093402,
                "type": "date",
                "sum": false
            },
            {
                "name": "targetName",
                "original": "Legacy Healing -Revshare",
                "formattedValue": "Legacy Healing -Revshare",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetId",
                "original": "TAc35562c1b5344d619e413923d29aaa2c",
                "formattedValue": "TAc35562c1b5344d619e413923d29aaa2c",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetNumber",
                "original": "+18508055432",
                "formattedValue": "+18508055432",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetBuyerId",
                "original": "BUcdbadab123474146bd0208686961cf1a",
                "formattedValue": "BUcdbadab123474146bd0208686961cf1a",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetBuyer",
                "original": "Legacy Healing Centers",
                "formattedValue": "Legacy Healing Centers",
                "type": "text",
                "sum": false
            },
            {
                "name": "totalAmount",
                "original": 0.175,
                "formattedValue": 0.175,
                "type": "currency",
                "sum": false
            }
        ]
    },
    {
        "name": "ConnectedCall",
        "weigth": 500,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:14:57.2834927Z",
                "formattedValue": 1625516097283,
                "type": "date",
                "sum": false
            },
            {
                "name": "timeToConnect",
                "original": 5,
                "formattedValue": 5,
                "type": "seconds",
                "sum": false
            },
            {
                "name": "callConnectionDt",
                "original": 1625516097267,
                "formattedValue": 1625516097267,
                "type": "date",
                "sum": false
            },
            {
                "name": "targetName",
                "original": "Legacy Healing -Revshare",
                "formattedValue": "Legacy Healing -Revshare",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetNumber",
                "original": "+18508055432",
                "formattedValue": "+18508055432",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetId",
                "original": "TAc35562c1b5344d619e413923d29aaa2c",
                "formattedValue": "TAc35562c1b5344d619e413923d29aaa2c",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetBuyerId",
                "original": "BUcdbadab123474146bd0208686961cf1a",
                "formattedValue": "BUcdbadab123474146bd0208686961cf1a",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetBuyer",
                "original": "Legacy Healing Centers",
                "formattedValue": "Legacy Healing Centers",
                "type": "text",
                "sum": false
            }
        ]
    },
    {
        "name": "ConvertedCall",
        "weigth": 600,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:16:07.0920758Z",
                "formattedValue": 1625516167092,
                "type": "date",
                "sum": false
            },
            {
                "name": "conversionAmount",
                "original": 61,
                "formattedValue": 61,
                "type": "currency",
                "sum": false
            },
            {
                "name": "payoutAmount",
                "original": 0,
                "formattedValue": 0,
                "type": "currency",
                "sum": false
            },
            {
                "name": "targetBuyerId",
                "original": "BUcdbadab123474146bd0208686961cf1a",
                "formattedValue": "BUcdbadab123474146bd0208686961cf1a",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetBuyer",
                "original": "Legacy Healing Centers",
                "formattedValue": "Legacy Healing Centers",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetName",
                "original": "Legacy Healing -Revshare",
                "formattedValue": "Legacy Healing -Revshare",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetNumber",
                "original": "+18508055432",
                "formattedValue": "+18508055432",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetId",
                "original": "TAc35562c1b5344d619e413923d29aaa2c",
                "formattedValue": "TAc35562c1b5344d619e413923d29aaa2c",
                "type": "text",
                "sum": false
            }
        ]
    },
    {
        "name": "CompletedCall",
        "weigth": 700,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:16:07.0920758Z",
                "formattedValue": 1625516167092,
                "type": "date",
                "sum": false
            },
            {
                "name": "callLengthInSeconds",
                "original": 75,
                "formattedValue": 75,
                "type": "seconds",
                "sum": false
            },
            {
                "name": "callCompletedDt",
                "original": 1625516167060,
                "formattedValue": 1625516167060,
                "type": "date",
                "sum": false
            },
            {
                "name": "targetBuyerId",
                "original": "BUcdbadab123474146bd0208686961cf1a",
                "formattedValue": "BUcdbadab123474146bd0208686961cf1a",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetBuyer",
                "original": "Legacy Healing Centers",
                "formattedValue": "Legacy Healing Centers",
                "type": "text",
                "sum": false
            },
            {
                "name": "totalAmount",
                "original": 0.23,
                "formattedValue": 0.23,
                "type": "currency",
                "sum": false
            }
        ]
    },
    {
        "name": "PayoutCall",
        "weigth": 610,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:16:07.1232864Z",
                "formattedValue": 1625516167123,
                "type": "date",
                "sum": false
            },
            {
                "name": "payoutAmount",
                "original": 57.2,
                "formattedValue": 57.2,
                "type": "currency",
                "sum": false
            }
        ]
    },
    {
        "name": "EndCallSource",
        "weigth": 1130,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:16:07.1232864Z",
                "formattedValue": 1625516167123,
                "type": "date",
                "sum": false
            },
            {
                "name": "source",
                "original": "Caller",
                "formattedValue": "Caller",
                "type": "text",
                "sum": false
            }
        ]
    },
    {
        "name": "RecordedCall",
        "weigth": 1030,
        "columns": [
            {
                "name": "dtStamp",
                "original": "2021-07-05T20:16:08.3392077Z",
                "formattedValue": 1625516168339,
                "type": "date",
                "sum": false
            },
            {
                "name": "recordingUrl",
                "original": "https://media.ringba.com/recording-public?v=v1&k=n8VpHOQnS69Yvs%2bmpKH4yf32FQF%2bJbPa%2bPtAUK2DQdkoNVhgqRQhDjjlAjFm4YiuOpT7k2UGXJlyOuhQ%2bL%2f4zJdGt%2btz58kfkUYTJke%2burh7WbS9c6zMhEq9fN7zasp96JIWxzjwfd00j4XnZgO%2fpZQ%2fzjZ02WmLX4n2S2iHhwHY7PGHFOXwXCKKVUz6HrGcLFyhttxq1qNtoOWEwB7Ufn%2f%2bzcvMv6s49rdU0bQOMVCteybACQszLMIG3unnKtbLgJJeOH1G%2bAVMEZG0UiSqs5Y3cek%3d",
                "formattedValue": "https://media.ringba.com/recording-public?v=v1&k=n8VpHOQnS69Yvs%2bmpKH4yf32FQF%2bJbPa%2bPtAUK2DQdkoNVhgqRQhDjjlAjFm4YiuOpT7k2UGXJlyOuhQ%2bL%2f4zJdGt%2btz58kfkUYTJke%2burh7WbS9c6zMhEq9fN7zasp96JIWxzjwfd00j4XnZgO%2fpZQ%2fzjZ02WmLX4n2S2iHhwHY7PGHFOXwXCKKVUz6HrGcLFyhttxq1qNtoOWEwB7Ufn%2f%2bzcvMv6s49rdU0bQOMVCteybACQszLMIG3unnKtbLgJJeOH1G%2bAVMEZG0UiSqs5Y3cek%3d",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetBuyerId",
                "original": "BUcdbadab123474146bd0208686961cf1a",
                "formattedValue": "BUcdbadab123474146bd0208686961cf1a",
                "type": "text",
                "sum": false
            },
            {
                "name": "targetBuyer",
                "original": "Legacy Healing Centers",
                "formattedValue": "Legacy Healing Centers",
                "type": "text",
                "sum": false
            }
        ]
    }
]


if (events.contains("targetBuyer")) {
console.log(true)
}



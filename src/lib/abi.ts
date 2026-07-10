export const bazaarRegistryAbi = [
  {
    "type": "function",
    "name": "CONTRACT_VERSION",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "cloneAgent",
    "stateMutability": "payable",
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "mission",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "riskLevel",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "monthlyBudget",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "cloneId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "cloneCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "deployAgent",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "network",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "deploymentId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "deploymentCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "getAverageRating",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "avgTimes100",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "getClone",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "cloneId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct BazaarRegistry.Clone",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "listingId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "owner",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "name",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "mission",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "riskLevel",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "monthlyBudget",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "createdAt",
            "type": "uint64",
            "internalType": "uint64"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getClonesByOwner",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "name": "getDeployment",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "deploymentId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct BazaarRegistry.Deployment",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "listingId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "deployer",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "network",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "deployedAt",
            "type": "uint64",
            "internalType": "uint64"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getDeploymentsByDeployer",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "deployer",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "name": "getListing",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct BazaarRegistry.Listing",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "creator",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "name",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "category",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "agentType",
            "type": "uint8",
            "internalType": "enum BazaarRegistry.AgentType"
          },
          {
            "name": "pricingModel",
            "type": "uint8",
            "internalType": "enum BazaarRegistry.PricingModel"
          },
          {
            "name": "monthlyPrice",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "cloneFee",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "mission",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "theme",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "capabilities",
            "type": "string[]",
            "internalType": "string[]"
          },
          {
            "name": "active",
            "type": "bool",
            "internalType": "bool"
          },
          {
            "name": "createdAt",
            "type": "uint64",
            "internalType": "uint64"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getListingPage",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "offset",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "limit",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "ids",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "name": "getListingsByCreator",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "creator",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "name": "getRental",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "rentalId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple",
        "internalType": "struct BazaarRegistry.Rental",
        "components": [
          {
            "name": "id",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "listingId",
            "type": "uint256",
            "internalType": "uint256"
          },
          {
            "name": "renter",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "startTime",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "endTime",
            "type": "uint64",
            "internalType": "uint64"
          },
          {
            "name": "usageMode",
            "type": "string",
            "internalType": "string"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "getRentalsByRenter",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "renter",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256[]",
        "internalType": "uint256[]"
      }
    ]
  },
  {
    "type": "function",
    "name": "getReviews",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "tuple[]",
        "internalType": "struct BazaarRegistry.Review[]",
        "components": [
          {
            "name": "rater",
            "type": "address",
            "internalType": "address"
          },
          {
            "name": "stars",
            "type": "uint8",
            "internalType": "uint8"
          },
          {
            "name": "comment",
            "type": "string",
            "internalType": "string"
          },
          {
            "name": "createdAt",
            "type": "uint64",
            "internalType": "uint64"
          }
        ]
      }
    ]
  },
  {
    "type": "function",
    "name": "listingClones",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "listingCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "listingDeployments",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "listingRentals",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "publishAgent",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "name",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "category",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "agentType",
        "type": "uint8",
        "internalType": "enum BazaarRegistry.AgentType"
      },
      {
        "name": "pricingModel",
        "type": "uint8",
        "internalType": "enum BazaarRegistry.PricingModel"
      },
      {
        "name": "monthlyPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "cloneFee",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "mission",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "theme",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "capabilities",
        "type": "string[]",
        "internalType": "string[]"
      }
    ],
    "outputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "rateAgent",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "stars",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "comment",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "ratingCount",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "ratingSum",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "recoverClone",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "cloneId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "rentAgent",
    "stateMutability": "payable",
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "periodDays",
        "type": "uint64",
        "internalType": "uint64"
      },
      {
        "name": "usageMode",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [
      {
        "name": "rentalId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "rentalCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "reviewIndexOf",
    "stateMutability": "view",
    "inputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "function",
    "name": "updateListing",
    "stateMutability": "nonpayable",
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "monthlyPrice",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "cloneFee",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "active",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": []
  },
  {
    "type": "event",
    "name": "AgentCloned",
    "anonymous": false,
    "inputs": [
      {
        "name": "cloneId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "listingId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "name",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ]
  },
  {
    "type": "event",
    "name": "AgentDeployed",
    "anonymous": false,
    "inputs": [
      {
        "name": "deploymentId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "listingId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "deployer",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "network",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ]
  },
  {
    "type": "event",
    "name": "AgentPublished",
    "anonymous": false,
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "name",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "category",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "agentType",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "pricingModel",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "monthlyPrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ]
  },
  {
    "type": "event",
    "name": "AgentRated",
    "anonymous": false,
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "rater",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "stars",
        "type": "uint8",
        "indexed": false,
        "internalType": "uint8"
      },
      {
        "name": "comment",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ]
  },
  {
    "type": "event",
    "name": "AgentRented",
    "anonymous": false,
    "inputs": [
      {
        "name": "rentalId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "listingId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "renter",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "endTime",
        "type": "uint64",
        "indexed": false,
        "internalType": "uint64"
      },
      {
        "name": "usageMode",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ]
  },
  {
    "type": "event",
    "name": "CloneRecovered",
    "anonymous": false,
    "inputs": [
      {
        "name": "cloneId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      }
    ]
  },
  {
    "type": "event",
    "name": "ListingUpdated",
    "anonymous": false,
    "inputs": [
      {
        "name": "listingId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "monthlyPrice",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "cloneFee",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "active",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ]
  },
  {
    "type": "error",
    "name": "EmptyName",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InsufficientPayment",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidPeriod",
    "inputs": []
  },
  {
    "type": "error",
    "name": "InvalidRating",
    "inputs": []
  },
  {
    "type": "error",
    "name": "ListingInactive",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotCloneOwner",
    "inputs": []
  },
  {
    "type": "error",
    "name": "NotCreator",
    "inputs": []
  },
  {
    "type": "error",
    "name": "Reentrant",
    "inputs": []
  },
  {
    "type": "error",
    "name": "SelfRentNotAllowed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "TransferFailed",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnknownClone",
    "inputs": []
  },
  {
    "type": "error",
    "name": "UnknownListing",
    "inputs": []
  }
] as const;

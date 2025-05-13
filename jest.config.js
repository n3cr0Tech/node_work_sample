module.exports = {
    clearMocks: true,
    restoreMocks: true,
    "roots": [        
      "<rootDir>"
    ],
    "testMatch": [
      "**/__unit_tests__/**/*.+(ts|tsx|js)",
      "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    "transform": {
      "^.+\\.(ts|tsx)$": "ts-jest"
    },
  }
const mongoose = require('mongoose');

const MotorcycleSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  type: {
    type: String, // e.g., Cruiser, Sport, Touring, etc.
    required: true
  },
  engineCapacity: {
    type: String, // e.g., 600cc, 1000cc
    required: true
  },
  mileage: {
    type: Number // in kilometers or miles
  },
  color: {
    type: String
  },
  status: {
    type: String, // e.g., Available, Sold, Maintenance
    required: true
  },
  maintenanceHistory: [
    {
      serviceType: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        required: true
      },
      description: {
        type: String
      }
    }
  ],
  insurance: {
    provider: {
      type: String
    },
    policyNumber: {
      type: String
    },
    validFrom: {
      type: Date
    },
    validTo: {
      type: Date
    }
  },
  accessories: {
    type: [String] // e.g., Saddlebags, Windshield, Custom Exhaust
  },
  social: {
    youtube: {
      type: String
    },
    instagram: {
      type: String
    },
    reddit: {
      type: String
    },
    tiktok: {
      type: String
    },
    facebook: {
      type: String
    },
    x: {
      type: String
    },
  },
  dateAdded: {
    type: Date,
    default: Date.now
  }
});

module.exports = Motorcycle = mongoose.model('motorcycle', MotorcycleSchema);

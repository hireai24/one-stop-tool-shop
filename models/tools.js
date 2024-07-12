const mongoose = require('mongoose');

const ToolSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    availability: {
        type: Date,
        required: true
    },
    image: {
        type: String,
        required: true
      },
      user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
      },
      company: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Company'
      },
      date: {
          type: Date,
          default: Date.now
      }
  });

  const Tool = mongoose.model('Tool', ToolSchema);

  module.exports = Tool;

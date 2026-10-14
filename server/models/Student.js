const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Student name cannot exceed 100 characters'],
    },
    studentClass: {
      type: String,
      required: [true, 'Class is required'],
      trim: true,
      maxlength: [50, 'Class cannot exceed 50 characters'],
    },
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      trim: true,
      unique: true,
      maxlength: [30, 'Roll number cannot exceed 30 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual property 'class' to allow frontend or API consumers to use either 'class' or 'studentClass'
studentSchema.virtual('class').get(function () {
  return this.studentClass;
});

module.exports = mongoose.models.Student || mongoose.model('Student', studentSchema);

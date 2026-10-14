const mongoose = require('mongoose');
const Student = require('../models/Student');

/**
 * @desc    Get all students with optional search filtering
 * @route   GET /api/students
 * @access  Private (Admin only)
 */
const getStudents = async (req, res, next) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query = {
        $or: [
          { name: searchRegex },
          { studentClass: searchRegex },
          { rollNumber: searchRegex },
        ],
      };
    }

    const students = await Student.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single student by ID
 * @route   GET /api/students/:id
 * @access  Private (Admin only)
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid student ID format: "${id}".`,
      });
    }

    const student = await Student.findById(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new student record
 * @route   POST /api/students
 * @access  Private (Admin only)
 */
const createStudent = async (req, res, next) => {
  try {
    let { name, studentClass, class: altClass, rollNumber, address } = req.body;
    const finalClass = studentClass || altClass;

    // Field-level validation
    const missingFields = [];
    if (!name || !name.trim()) missingFields.push('Student Name');
    if (!finalClass || !finalClass.trim()) missingFields.push('Class');
    if (!rollNumber || !rollNumber.trim()) missingFields.push('Roll Number');
    if (!address || !address.trim()) missingFields.push('Address');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required field(s): ${missingFields.join(', ')}.`,
      });
    }

    const cleanRollNumber = rollNumber.trim();

    // Check for duplicate roll number
    const existingStudent = await Student.findOne({
      rollNumber: { $regex: new RegExp(`^${cleanRollNumber}$`, 'i') },
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `A student with Roll Number "${cleanRollNumber}" already exists. Roll number must be unique.`,
      });
    }

    const student = await Student.create({
      name: name.trim(),
      studentClass: finalClass.trim(),
      rollNumber: cleanRollNumber,
      address: address.trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Student record created successfully.',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing student record
 * @route   PUT /api/students/:id
 * @access  Private (Admin only)
 */
const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { name, studentClass, class: altClass, rollNumber, address } = req.body;
    const finalClass = studentClass !== undefined ? studentClass : altClass;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid student ID format: "${id}".`,
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    // Field-level validation
    const missingFields = [];
    if (name !== undefined && !name.trim()) missingFields.push('Student Name');
    if (finalClass !== undefined && !finalClass.trim()) missingFields.push('Class');
    if (rollNumber !== undefined && !rollNumber.trim()) missingFields.push('Roll Number');
    if (address !== undefined && !address.trim()) missingFields.push('Address');

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Field(s) cannot be empty: ${missingFields.join(', ')}.`,
      });
    }

    // Check roll number collision if rollNumber is changed
    if (rollNumber && rollNumber.trim() !== student.rollNumber) {
      const cleanRollNumber = rollNumber.trim();
      const duplicateStudent = await Student.findOne({
        _id: { $ne: id },
        rollNumber: { $regex: new RegExp(`^${cleanRollNumber}$`, 'i') },
      });

      if (duplicateStudent) {
        return res.status(400).json({
          success: false,
          message: `Cannot update: A student with Roll Number "${cleanRollNumber}" already exists.`,
        });
      }
      student.rollNumber = cleanRollNumber;
    }

    if (name) student.name = name.trim();
    if (finalClass) student.studentClass = finalClass.trim();
    if (address) student.address = address.trim();

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student record updated successfully.',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a student record
 * @route   DELETE /api/students/:id
 * @access  Private (Admin only)
 */
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid student ID format: "${id}".`,
      });
    }

    const student = await Student.findByIdAndDelete(id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.',
      });
    }

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" (Roll: ${student.rollNumber}) deleted successfully.`,
      data: {
        id: student._id,
        name: student.name,
        rollNumber: student.rollNumber,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};

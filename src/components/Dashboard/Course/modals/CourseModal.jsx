import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchApi } from "../../Course";

export const CourseModal = ({
  isOpen,
  onClose,
  course,
  onSubmit,
  isEditing,
}) => {
  const [formData, setFormData] = useState({
    course_code: course?.course_code || "",
    course_name: course?.course_name || "",
    start_date: course?.start_date?.split("T")[0] || "",
    end_date: course?.end_date?.split("T")[0] || "",
    year: course?.year || new Date().getFullYear(),
    semester: course?.semester || "1",
    is_active: course?.is_active !== undefined ? course.is_active : true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState({});
  useEffect(() => {
    if (isOpen) {
      setFormData({
        course_code: course?.course_code || "",
        course_name: course?.course_name || "",
        start_date: course?.start_date?.split("T")[0] || "",
        end_date: course?.end_date?.split("T")[0] || "",
        year: course?.year || new Date().getFullYear(),
        semester: course?.semester || "1",
        is_active: course?.is_active !== undefined ? course.is_active : true,
      });
      setTouched({});
      setError("");
    }
  }, [isOpen, course]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.course_code.trim() && !isEditing) {
      newErrors.course_code = "Course code is required";
    }

    if (!formData.course_name.trim()) {
      newErrors.course_name = "Course name is required";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }

    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    } else if (
      formData.start_date &&
      new Date(formData.end_date) <= new Date(formData.start_date)
    ) {
      newErrors.end_date = "End date must be after start date";
    }

    return Object.keys(newErrors).length > 0 ? newErrors : null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);
    const formErrors = validateForm();

    if (formErrors) {
      setError("Please fix the form errors");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      let response;

      if (isEditing) {
        response = await fetchApi(`/professors/courses/${course.id}`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetchApi("/professors/courses", {
          method: "POST",
          body: JSON.stringify(formData),
        });
      }

      onSubmit(response.data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.2,
          }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{
              scale: 0.9,
              opacity: 0,
            }}
            animate={{
              scale: 1,
              opacity: 1,
            }}
            exit={{
              scale: 0.9,
              opacity: 0,
            }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 400,
            }}
            className="bg-white rounded-xl p-6 md:p-8 max-w-md w-full overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <motion.h2
                initial={{
                  x: -20,
                  opacity: 0,
                }}
                animate={{
                  x: 0,
                  opacity: 1,
                }}
                className="text-xl font-semibold"
              >
                {isEditing ? "Edit Course" : "Add New Course"}
              </motion.h2>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  rotate: 90,
                }}
                whileTap={{
                  scale: 0.9,
                }}
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </motion.button>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{
                    height: 0,
                    opacity: 0,
                  }}
                  animate={{
                    height: "auto",
                    opacity: 1,
                  }}
                  exit={{
                    height: 0,
                    opacity: 0,
                  }}
                  className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg flex items-start gap-2 overflow-hidden"
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Code *
                  </label>
                  <motion.input
                    whileFocus={{
                      scale: 1.01,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    type="text"
                    name="course_code"
                    value={formData.course_code}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      touched.course_code && !formData.course_code
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="e.g., CS F111"
                    required
                  />
                  {touched.course_code && !formData.course_code && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-1 text-sm text-red-500"
                    >
                      Course code is required
                    </motion.p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Name *
                </label>
                <motion.input
                  whileFocus={{
                    scale: 1.01,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                  type="text"
                  name="course_name"
                  value={formData.course_name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border ${
                    touched.course_name && !formData.course_name
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  placeholder="e.g., Computer Programming"
                  required
                />
                {touched.course_name && !formData.course_name && (
                  <motion.p
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="mt-1 text-sm text-red-500"
                  >
                    Course name is required
                  </motion.p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <motion.input
                    whileFocus={{
                      scale: 1.01,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    type="date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      touched.start_date && !formData.start_date
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    required
                  />
                  {touched.start_date && !formData.start_date && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-1 text-sm text-red-500"
                    >
                      Start date is required
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <motion.input
                    whileFocus={{
                      scale: 1.01,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 25,
                    }}
                    type="date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      touched.end_date &&
                      (!formData.end_date ||
                        (formData.start_date &&
                          new Date(formData.end_date) <=
                            new Date(formData.start_date)))
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    required
                  />
                  {touched.end_date && !formData.end_date && (
                    <motion.p
                      initial={{
                        opacity: 0,
                        y: -10,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="mt-1 text-sm text-red-500"
                    >
                      End date is required
                    </motion.p>
                  )}
                  {touched.end_date &&
                    formData.end_date &&
                    formData.start_date &&
                    new Date(formData.end_date) <=
                      new Date(formData.start_date) && (
                      <motion.p
                        initial={{
                          opacity: 0,
                          y: -10,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        className="mt-1 text-sm text-red-500"
                      >
                        End date must be after start date
                      </motion.p>
                    )}
                </div>
              </div>

              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is-active"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="is-active"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Active
                    </label>
                  </div>
                </div>
              )}

              <motion.div
                className="flex justify-end gap-3 pt-4 mt-6"
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                transition={{
                  delay: 0.2,
                }}
              >
                <motion.button
                  whileHover={{
                    scale: 1.03,
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{
                    scale: 1.03,
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  whileTap={{
                    scale: 0.97,
                  }}
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2 transition-all duration-300"
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{
                          rotate: 360,
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1,
                          ease: "linear",
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>{isEditing ? "Update Course" : "Add Course"}</span>
                  )}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

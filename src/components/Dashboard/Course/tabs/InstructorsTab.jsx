import React from 'react';
import { 
  Search, Upload, Plus, Edit2, Trash2,
  Mail, Building, Clock, GraduationCap,
  Users 
} from 'lucide-react';

const InstructorsTab = ({
  instructors = [], 
  searchQuery = '',
  onSearchChange = () => {},
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onImport = () => {}
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search instructors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={onImport}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Upload size={20} />
            Import
          </button>
          
          <button
            onClick={onAdd}
            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Instructor
          </button>
        </div>
      </div>

      {instructors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {instructors.map((instructor) => (
            <div key={instructor.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-lg font-medium text-blue-600">
                      {instructor.name?.charAt(0) || '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h4 className="text-lg font-medium text-gray-900">{instructor.name || 'Unknown'}</h4>
                    <p className="text-sm text-gray-500">{instructor.role || 'Instructor'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(instructor)}
                    className="p-1.5 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit instructor"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(instructor)}
                    className="p-1.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove instructor"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 space-y-3">
                {instructor.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>{instructor.email}</span>
                  </div>
                )}
                {instructor.office && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    <span>{instructor.office}</span>
                  </div>
                )}
                {instructor.officeHours && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>{instructor.officeHours}</span>
                  </div>
                )}
                {instructor.expertise && (
                  <div className="flex items-center text-sm text-gray-600">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <span>{instructor.expertise}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <div className="flex flex-col items-center">
            <Users className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No instructors found</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by adding instructors to this course</p>
            <button
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Plus size={20} />
              Add First Instructor
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorsTab;
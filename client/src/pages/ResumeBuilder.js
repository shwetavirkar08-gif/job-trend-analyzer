import React, { useState, useEffect, useRef } from 'react';
import { FileText, User, Briefcase, GraduationCap, Award, Download, Eye, Save, MapPin, Calendar, Globe, Languages, Star, Trophy, Activity, Heart } from 'lucide-react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const ResumeBuilder = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      address: '',
      dateOfBirth: '',
      languages: [],
      summary: ''
    },
    experience: [
      {
        id: 1,
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        durationMonths: '',
        description: ['']
      }
    ],
    education: [
      {
        id: 1,
        institution: '',
        degree: '',
        field: '',
        startDate: '',
        endDate: '',
        gpa: ''
      }
    ],
    skills: [],
    certifications: [],
    extracurricular: [],
    domains: [],
    interests: []
  });
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const resumeRef = useRef(null);
  const [gridPreview, setGridPreview] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/resume/templates');
      setTemplates(response.data.data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    }
  };

  const handleInputChange = (section, field, value, index = null) => {
    if (index !== null) {
      setResumeData(prev => ({
        ...prev,
        [section]: prev[section].map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }));
    } else {
      setResumeData(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    }
  };

  const addExperience = () => {
    const newExperience = {
      id: Date.now(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      durationMonths: '',
      description: ['']
    };
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
  };

  const removeExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleExperiencePointChange = (expIndex, pointIndex, value) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex
          ? { ...exp, description: exp.description.map((pt, j) => j === pointIndex ? value : pt) }
          : exp
      )
    }));
  };

  const addExperiencePoint = (expIndex) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex
          ? { ...exp, description: [...exp.description, ''] }
          : exp
      )
    }));
  };

  const removeExperiencePoint = (expIndex, pointIndex) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === expIndex
          ? { ...exp, description: exp.description.filter((_, j) => j !== pointIndex) }
          : exp
      )
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const removeEducation = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const addSkill = () => {
    const skill = prompt('Enter a skill:');
    if (skill && skill.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skill.trim()]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addLanguage = () => {
    const language = prompt('Enter a language:');
    if (language && language.trim()) {
      setResumeData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          languages: [...prev.personalInfo.languages, language.trim()]
        }
      }));
    }
  };

  const removeLanguage = (languageToRemove) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        languages: prev.personalInfo.languages.filter(lang => lang !== languageToRemove)
      }
    }));
  };

  const addCertification = () => {
    const newCertification = {
      id: Date.now(),
      name: '',
      issuer: '',
      date: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
  };

  const removeCertification = (index) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addExtracurricular = () => {
    const newActivity = {
      id: Date.now(),
      title: '',
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      extracurricular: [...prev.extracurricular, newActivity]
    }));
  };

  const removeExtracurricular = (index) => {
    setResumeData(prev => ({
      ...prev,
      extracurricular: prev.extracurricular.filter((_, i) => i !== index)
    }));
  };

  const addDomain = () => {
    const domain = prompt('Enter a domain/field of interest:');
    if (domain && domain.trim()) {
      setResumeData(prev => ({
        ...prev,
        domains: [...prev.domains, domain.trim()]
      }));
    }
  };

  const removeDomain = (domainToRemove) => {
    setResumeData(prev => ({
      ...prev,
      domains: prev.domains.filter(domain => domain !== domainToRemove)
    }));
  };

  const addInterest = () => {
    const interest = prompt('Enter an interest:');
    if (interest && interest.trim()) {
      setResumeData(prev => ({
        ...prev,
        interests: [...prev.interests, interest.trim()]
      }));
    }
  };

  const removeInterest = (interestToRemove) => {
    setResumeData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const downloadResumeAsPDF = async () => {
    if (!resumeRef.current) return;

    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `${resumeData.personalInfo.firstName || 'Resume'}_${resumeData.personalInfo.lastName || 'Document'}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/resume/builder', resumeData);
      alert('Resume created successfully! You can now download it as PDF.');
      console.log('Resume analysis:', response.data.data.analysis);
    } catch (error) {
      alert('Failed to create resume. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { name: 'Personal Info', icon: User },
    { name: 'Experience', icon: Briefcase },
    { name: 'Education', icon: GraduationCap },
    { name: 'Skills', icon: Award },
    { name: 'Certifications', icon: Trophy },
    { name: 'Extracurricular', icon: Activity },
    { name: 'Domains & Interests', icon: Heart },
    { name: 'Template', icon: FileText }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
          <input
            type="text"
            value={resumeData.personalInfo.firstName}
            onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
            className="input-field"
            placeholder="Rahul"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
          <input
            type="text"
            value={resumeData.personalInfo.lastName}
            onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
            className="input-field"
            placeholder="Sharma"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={resumeData.personalInfo.email}
            onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
            className="input-field"
            placeholder="rahul.sharma@email.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
          <input
            type="tel"
            value={resumeData.personalInfo.phone}
            onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
            className="input-field"
            placeholder="+91 98765 43210"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          Location
        </label>
        <input
          type="text"
          value={resumeData.personalInfo.location}
          onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
          className="input-field"
          placeholder="Mumbai, Maharashtra"
        />
        <p className="text-xs text-gray-500 mt-1">Popular Indian cities: Mumbai, Bangalore, Delhi, Hyderabad, Pune, Chennai</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <textarea
          value={resumeData.personalInfo.address}
          onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
          className="input-field"
          rows={3}
          placeholder="Full address including street, city, state, and PIN code"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2" />
          Date of Birth
        </label>
        <input
          type="date"
          value={resumeData.personalInfo.dateOfBirth}
          onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
          className="input-field"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700 flex items-center">
            <Languages className="w-4 h-4 mr-2" />
            Languages Known
          </label>
          <button onClick={addLanguage} className="btn-secondary text-sm">
            <Star className="w-4 h-4 mr-2" />
            Add Language
          </button>
        </div>
        {resumeData.personalInfo.languages.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {resumeData.personalInfo.languages.map((language, index) => (
              <span key={index} className="badge badge-primary">
                {language}
                <button
                  onClick={() => removeLanguage(language)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No languages added yet. Click "Add Language" to get started.</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
        <textarea
          value={resumeData.personalInfo.summary}
          onChange={(e) => handleInputChange('personalInfo', 'summary', e.target.value)}
          className="input-field"
          rows={4}
          placeholder="Brief professional summary highlighting your key strengths and career objectives for the Indian job market..."
        />
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
        <button onClick={addExperience} className="btn-secondary">
          <Briefcase className="w-4 h-4 mr-2" />
          Add Experience
        </button>
      </div>

      {resumeData.experience.map((exp, index) => (
        <div key={exp.id} className="card">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-medium text-gray-900">Experience #{index + 1}</h4>
            {resumeData.experience.length > 1 && (
              <button
                onClick={() => removeExperience(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => handleInputChange('experience', 'company', e.target.value, index)}
                className="input-field"
                placeholder="TCS, Infosys, Wipro, HCL, Tech Mahindra"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) => handleInputChange('experience', 'position', e.target.value, index)}
                className="input-field"
                placeholder="Software Engineer, Senior Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => handleInputChange('experience', 'startDate', e.target.value, index)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => handleInputChange('experience', 'endDate', e.target.value, index)}
                className="input-field"
                disabled={exp.current}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id={`current-${exp.id}`}
                checked={exp.current}
                onChange={(e) => handleInputChange('experience', 'current', e.target.checked, index)}
                className="mr-2"
              />
              <label htmlFor={`current-${exp.id}`} className="text-sm text-gray-700">
                Current Position
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration (months)</label>
              <input
                type="number"
                min="0"
                value={exp.durationMonths}
                onChange={(e) => handleInputChange('experience', 'durationMonths', e.target.value, index)}
                className="input-field"
                placeholder="e.g. 18"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Points)</label>
            {exp.description.map((point, ptIdx) => (
              <div key={ptIdx} className="flex items-center mb-2">
                <textarea
                  value={point}
                  onChange={e => handleExperiencePointChange(index, ptIdx, e.target.value)}
                  className="input-field flex-1"
                  rows={1}
                  placeholder={`Point ${ptIdx + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeExperiencePoint(index, ptIdx)}
                  className="ml-2 text-red-500 hover:text-red-700"
                  disabled={exp.description.length === 1}
                >
                  ×
                </button>
              </div>
            ))}
            <button type="button" onClick={() => addExperiencePoint(index)} className="btn-secondary text-xs mt-2">
              + Add Point
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Education</h3>
        <button onClick={addEducation} className="btn-secondary">
          <GraduationCap className="w-4 h-4 mr-2" />
          Add Education
        </button>
      </div>

      {resumeData.education.map((edu, index) => (
        <div key={edu.id} className="card">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-medium text-gray-900">Education #{index + 1}</h4>
            {resumeData.education.length > 1 && (
              <button
                onClick={() => removeEducation(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institution</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => handleInputChange('education', 'institution', e.target.value, index)}
                className="input-field"
                placeholder="IIT, NIT, BITS, Delhi University, Mumbai University"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => handleInputChange('education', 'degree', e.target.value, index)}
                className="input-field"
                placeholder="B.Tech, B.E., M.Tech, MCA, BCA"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
              <input
                type="text"
                value={edu.field}
                onChange={(e) => handleInputChange('education', 'field', e.target.value, index)}
                className="input-field"
                placeholder="Computer Science, Information Technology"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="month"
                value={edu.startDate}
                onChange={(e) => handleInputChange('education', 'startDate', e.target.value, index)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="month"
                value={edu.endDate}
                onChange={(e) => handleInputChange('education', 'endDate', e.target.value, index)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">CGPA/Percentage (Optional)</label>
            <input
              type="text"
              value={edu.gpa}
              onChange={(e) => handleInputChange('education', 'gpa', e.target.value, index)}
              className="input-field"
              placeholder="8.5/10 or 85%"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Skills</h3>
        <button onClick={addSkill} className="btn-secondary">
          <Award className="w-4 h-4 mr-2" />
          Add Skill
        </button>
      </div>

      <div className="card">
        <p className="text-sm text-gray-600 mb-4">
          Add your technical and soft skills relevant to the Indian job market. These will be used to match you with relevant job opportunities.
        </p>
        
        {resumeData.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {resumeData.skills.map((skill, index) => (
              <span key={index} className="badge badge-primary">
                {skill}
                <button
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No skills added yet. Click "Add Skill" to get started.</p>
        )}
      </div>
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Certifications</h3>
        <button onClick={addCertification} className="btn-secondary">
          <Trophy className="w-4 h-4 mr-2" />
          Add Certification
        </button>
      </div>

      {resumeData.certifications.map((cert, index) => (
        <div key={cert.id} className="card">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-medium text-gray-900">Certification #{index + 1}</h4>
            <button
              onClick={() => removeCertification(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certification Name</label>
              <input
                type="text"
                value={cert.name}
                onChange={(e) => handleInputChange('certifications', 'name', e.target.value, index)}
                className="input-field"
                placeholder="AWS Certified Solutions Architect, Google Cloud Professional"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Issuing Organization</label>
              <input
                type="text"
                value={cert.issuer}
                onChange={(e) => handleInputChange('certifications', 'issuer', e.target.value, index)}
                className="input-field"
                placeholder="Amazon Web Services, Google, Microsoft"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Earned</label>
              <input
                type="month"
                value={cert.date}
                onChange={(e) => handleInputChange('certifications', 'date', e.target.value, index)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
              <input
                type="text"
                value={cert.description}
                onChange={(e) => handleInputChange('certifications', 'description', e.target.value, index)}
                className="input-field"
                placeholder="Brief description of the certification"
              />
            </div>
          </div>
        </div>
      ))}

      {resumeData.certifications.length === 0 && (
        <div className="card">
          <p className="text-gray-500 text-center py-8">
            No certifications added yet. Click "Add Certification" to get started.
          </p>
        </div>
      )}
    </div>
  );

  const renderExtracurricular = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-900">Extracurricular Activities</h3>
        <button onClick={addExtracurricular} className="btn-secondary">
          <Activity className="w-4 h-4 mr-2" />
          Add Activity
        </button>
      </div>

      {resumeData.extracurricular.map((activity, index) => (
        <div key={activity.id} className="card">
          <div className="flex justify-between items-start mb-4">
            <h4 className="text-lg font-medium text-gray-900">Activity #{index + 1}</h4>
            <button
              onClick={() => removeExtracurricular(index)}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Remove
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activity Title</label>
              <input
                type="text"
                value={activity.title}
                onChange={(e) => handleInputChange('extracurricular', 'title', e.target.value, index)}
                className="input-field"
                placeholder="Student Council President, Tech Club Lead, Sports Captain"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
              <input
                type="text"
                value={activity.organization}
                onChange={(e) => handleInputChange('extracurricular', 'organization', e.target.value, index)}
                className="input-field"
                placeholder="University, College, Club Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Role</label>
              <input
                type="text"
                value={activity.role}
                onChange={(e) => handleInputChange('extracurricular', 'role', e.target.value, index)}
                className="input-field"
                placeholder="President, Secretary, Member, Lead"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="month"
                  value={activity.startDate}
                  onChange={(e) => handleInputChange('extracurricular', 'startDate', e.target.value, index)}
                  className="input-field"
                  placeholder="Start Date"
                />
                <input
                  type="month"
                  value={activity.endDate}
                  onChange={(e) => handleInputChange('extracurricular', 'endDate', e.target.value, index)}
                  className="input-field"
                  placeholder="End Date"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={activity.description}
              onChange={(e) => handleInputChange('extracurricular', 'description', e.target.value, index)}
              className="input-field"
              rows={3}
              placeholder="Describe your responsibilities, achievements, and impact in this role..."
            />
          </div>
        </div>
      ))}

      {resumeData.extracurricular.length === 0 && (
        <div className="card">
          <p className="text-gray-500 text-center py-8">
            No extracurricular activities added yet. Click "Add Activity" to get started.
          </p>
        </div>
      )}
    </div>
  );

  const renderDomainsAndInterests = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Domains Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Domains of Interest
            </h3>
            <button onClick={addDomain} className="btn-secondary text-sm">
              <Star className="w-4 h-4 mr-2" />
              Add Domain
            </button>
          </div>
          
          <div className="card">
            <p className="text-sm text-gray-600 mb-4">
              Add domains or fields you're interested in working in (e.g., AI/ML, Web Development, Data Science)
            </p>
            
            {resumeData.domains.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {resumeData.domains.map((domain, index) => (
                  <span key={index} className="badge badge-secondary">
                    {domain}
                    <button
                      onClick={() => removeDomain(domain)}
                      className="ml-2 text-secondary-600 hover:text-secondary-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No domains added yet.</p>
            )}
          </div>
        </div>

        {/* Interests Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Heart className="w-5 h-5 mr-2" />
              Personal Interests
            </h3>
            <button onClick={addInterest} className="btn-secondary text-sm">
              <Star className="w-4 h-4 mr-2" />
              Add Interest
            </button>
          </div>
          
          <div className="card">
            <p className="text-sm text-gray-600 mb-4">
              Add your personal interests and hobbies that showcase your personality
            </p>
            
            {resumeData.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {resumeData.interests.map((interest, index) => (
                  <span key={index} className="badge badge-accent">
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-accent-600 hover:text-accent-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No interests added yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTemplateSelection = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Choose Template</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`card cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'ring-2 ring-primary-500 bg-primary-50'
                : 'hover:shadow-md'
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
              <FileText className="w-16 h-16 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">{template.name}</h4>
            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
            <span className="badge badge-secondary text-xs">{template.category}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: return renderPersonalInfo();
      case 1: return renderExperience();
      case 2: return renderEducation();
      case 3: return renderSkills();
      case 4: return renderCertifications();
      case 5: return renderExtracurricular();
      case 6: return renderDomainsAndInterests();
      case 7: return renderTemplateSelection();
      default: return null;
    }
  };

  const nextStep = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const prevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const getStepDescription = (stepIndex) => {
    switch (stepIndex) {
      case 0: return 'Enter your personal details and contact information.';
      case 1: return 'Add your work experience and professional history.';
      case 2: return 'List your educational background and qualifications.';
      case 3: return 'Highlight your key skills and competencies.';
      case 4: return 'Add your professional certifications and achievements.';
      case 5: return 'Share your extracurricular activities and interests.';
      case 6: return 'Select a template and customize your resume design.';
      default: return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-primary-100 rounded-lg mr-4">
            <FileText className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Resume Builder</h1>
            <p className="text-gray-600 mt-2 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Create a professional resume for the Indian job market
            </p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === activeStep;
            const isCompleted = index < activeStep;
            
            return (
              <div key={index} className="flex items-center flex-shrink-0">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  isActive
                    ? 'border-primary-500 bg-primary-500 text-white'
                    : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                }`}>
                  {isCompleted ? (
                    <span className="text-sm font-bold">✓</span>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
        
        {/* Quick Navigation Dropdown */}
        <div className="mt-4 flex justify-center">
          <div className="relative">
            <select
              value={activeStep}
              onChange={(e) => setActiveStep(parseInt(e.target.value))}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
            >
              {steps.map((step, index) => (
                <option key={index} value={index}>
                  {index + 1}. {step.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Step Content with Scrollbar */}
      <div className="card mb-8 animate-slide-up step-content-scrollable">
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar px-2">
          {renderStepContent()}
        </div>
        {/* Scroll Indicator */}
        <div className="text-center mt-2 text-xs text-gray-400">
          <div className="flex items-center justify-center space-x-1">
            <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <span className="ml-2">Scroll to see more content</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={activeStep === 0}
          className={`btn-secondary ${activeStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Previous
        </button>

        <div className="flex gap-4">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className="btn-secondary"
          >
            <Eye className="w-4 h-4 mr-2" />
            {previewMode ? 'Hide Preview' : 'Preview'}
          </button>

          {activeStep === steps.length - 1 && (
            <button
              onClick={downloadResumeAsPDF}
              className="btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </button>
          )}

          {activeStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Creating...' : 'Create Resume'}
            </button>
          ) : (
            <button onClick={nextStep} className="btn-primary">
              Next
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout Toggle */}
      <div className="flex justify-end mt-2">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={gridPreview}
            onChange={e => setGridPreview(e.target.checked)}
            className="form-checkbox h-4 w-4 text-primary-600"
          />
          <span className="text-sm text-gray-700">Grid Layout Preview</span>
        </label>
      </div>

      {/* Step Indicator */}
      <div className="mt-6 text-center">
        <div className="inline-flex items-center space-x-2 bg-gray-100 rounded-full px-4 py-2">
          <span className="text-sm text-gray-600">Step</span>
          <span className="text-lg font-semibold text-primary-600">{activeStep + 1}</span>
          <span className="text-sm text-gray-600">of {steps.length}</span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {steps[activeStep].name} - {getStepDescription(activeStep)}
        </p>
      </div>

      {/* Preview Mode */}
      {previewMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Resume Preview</h3>
                <div className="flex gap-2">
                  <button
                    onClick={downloadResumeAsPDF}
                    className="btn-secondary text-sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </button>
                  <button
                    onClick={() => setPreviewMode(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>
              </div>
              
              <div ref={resumeRef} className={`border rounded-lg p-6 bg-gray-50 ${gridPreview ? 'grid grid-cols-1 md:grid-cols-2 gap-8' : ''}`}> 
                {/* Column 1 */}
                <div className={gridPreview ? '' : undefined}>
                  <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {resumeData.personalInfo.firstName} {resumeData.personalInfo.lastName}
                    </h1>
                    <p className="text-gray-600">{resumeData.personalInfo.email}</p>
                    <p className="text-gray-600">{resumeData.personalInfo.phone}</p>
                    <p className="text-gray-600">{resumeData.personalInfo.location}</p>
                    {resumeData.personalInfo.address && (
                      <p className="text-gray-600">{resumeData.personalInfo.address}</p>
                    )}
                    {resumeData.personalInfo.dateOfBirth && (
                      <p className="text-gray-600">DOB: {resumeData.personalInfo.dateOfBirth}</p>
                    )}
                    {resumeData.personalInfo.languages.length > 0 && (
                      <p className="text-gray-600">Languages: {resumeData.personalInfo.languages.join(', ')}</p>
                    )}
                  </div>

                  {resumeData.personalInfo.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2">Summary</h2>
                      <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
                    </div>
                  )}

                  {resumeData.skills.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                          <span key={index} className="badge badge-primary">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {resumeData.certifications.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Certifications</h2>
                      {resumeData.certifications.map((cert, index) => (
                        <div key={index} className="mb-4">
                          <h3 className="font-medium text-gray-900">{cert.name}</h3>
                          <p className="text-gray-600">{cert.issuer}</p>
                          <p className="text-sm text-gray-500">Earned: {cert.date}</p>
                          {cert.description && (
                            <p className="text-gray-700 mt-2">{cert.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 2 */}
                <div className={gridPreview ? '' : undefined}>
                  {resumeData.experience.some(exp => exp.company) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Experience</h2>
                      {resumeData.experience.map((exp, index) => (
                        exp.company && (
                          <div key={index} className="mb-4">
                            <h3 className="font-medium text-gray-900">{exp.position}</h3>
                            <p className="text-gray-600">{exp.company}</p>
                            <p className="text-sm text-gray-500">
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                              {exp.durationMonths && (
                                <span> &middot; {exp.durationMonths} months</span>
                              )}
                            </p>
                            {exp.description.length > 0 && (
                              <ul className="list-disc list-inside text-gray-700 mt-2">
                                {exp.description.map((point, ptIdx) => (
                                  <li key={ptIdx}>{point}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {resumeData.education.some(edu => edu.institution) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Education</h2>
                      {resumeData.education.map((edu, index) => (
                        edu.institution && (
                          <div key={index} className="mb-4">
                            <h3 className="font-medium text-gray-900">{edu.degree} in {edu.field}</h3>
                            <p className="text-gray-600">{edu.institution}</p>
                            <p className="text-sm text-gray-500">
                              {edu.startDate} - {edu.endDate}
                            </p>
                            {edu.gpa && (
                              <p className="text-sm text-gray-500">CGPA/Percentage: {edu.gpa}</p>
                            )}
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {resumeData.extracurricular.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Extracurricular Activities</h2>
                      {resumeData.extracurricular.map((activity, index) => (
                        <div key={index} className="mb-4">
                          <h3 className="font-medium text-gray-900">{activity.title}</h3>
                          <p className="text-gray-600">{activity.organization} - {activity.role}</p>
                          <p className="text-sm text-gray-500">
                            {activity.startDate} - {activity.endDate}
                          </p>
                          {activity.description && (
                            <p className="text-gray-700 mt-2">{activity.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {(resumeData.domains.length > 0 || resumeData.interests.length > 0) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h2>
                      {resumeData.domains.length > 0 && (
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">Domains of Interest</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.domains.map((domain, index) => (
                              <span key={index} className="badge badge-secondary">{domain}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {resumeData.interests.length > 0 && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Personal Interests</h3>
                          <div className="flex flex-wrap gap-2">
                            {resumeData.interests.map((interest, index) => (
                              <span key={index} className="badge badge-accent">{interest}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;

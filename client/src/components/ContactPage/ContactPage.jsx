import React, { useState } from 'react';
import NavHome from '../NavHome/NavHome';
import './ContactPage.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form data:', formData);
  };

  return (
    <div>
      {/* Navigation */}
      <nav className="nav">
        <NavHome />
      </nav>

      <div className="contact-container">
        <div className="contact-info">
          <h2>Contactez nous ! </h2>
          <p>Si vous avez des questions ou si vous souhaitez obtenir plus d'informations, veuillez remplir le formulaire ci-dessous et nous vous contacterons rapidement.</p>
          <div className="contact-details">
            <p><strong>Email :</strong> contact@sheeesh.eu</p>
            <p><strong>Téléphone :</strong> +33 7 82 75 19 18</p>
          </div>
        </div>
        <div className="contact-form">
          <p className="mandatory-fields">Les champs * sont obligatoires</p>
          <form onSubmit={handleSubmit}>
            <div className="name-fields">
              <div className="form-group">
                <label htmlFor="firstName">Prénom*</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Nom*</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="company">Entreprise*</label>
              <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Téléphone*</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="subject">Sujet*</label>
              <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="message">Message*</label>
              <textarea id="message" name="message" value={formData.message} onChange={handleChange} required></textarea>
            </div>
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

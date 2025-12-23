import { useState, useEffect } from 'react';

const defaultSettings = {
  firstName: false,
  lastName: false,
  propertyAddress: false,
  propertyAddressPartial: false,
  mailingAddress: false,
  mailingAddressPartial: false,
  phoneNumber: false,
  phoneNumberPartial: false,
  email: false,
  emailPartial: false,
};

export function useSensitiveBlur() {
  const [blurSettings, setBlurSettings] = useState(() => {
    const saved = localStorage.getItem('sensitiveInfoBlur');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    const handleChange = (e) => {
      setBlurSettings(e.detail);
    };
    window.addEventListener('blurSettingsChanged', handleChange);
    return () => window.removeEventListener('blurSettingsChanged', handleChange);
  }, []);

  // Helper function to blur text with CSS
  const blurClass = 'blur-sm select-none';

  // Format functions that apply blur or masking
  const formatName = (firstName, lastName) => {
    const blurredFirst = blurSettings.firstName;
    const blurredLast = blurSettings.lastName;
    
    return {
      firstName: firstName || '',
      lastName: lastName || '',
      firstNameClass: blurredFirst ? blurClass : '',
      lastNameClass: blurredLast ? blurClass : '',
      fullName: `${firstName || ''} ${lastName || ''}`.trim(),
      fullNameClass: (blurredFirst || blurredLast) ? blurClass : '',
    };
  };

  const formatPhone = (phone) => {
    if (!phone) return { value: '', className: '' };
    
    if (blurSettings.phoneNumber) {
      return { value: phone, className: blurClass };
    }
    if (blurSettings.phoneNumberPartial) {
      // Show only last 4 digits
      const masked = phone.replace(/\d(?=\d{4})/g, '•');
      return { value: masked, className: '' };
    }
    return { value: phone, className: '' };
  };

  const formatEmail = (email) => {
    if (!email) return { value: '', className: '' };
    
    if (blurSettings.email) {
      return { value: email, className: blurClass };
    }
    if (blurSettings.emailPartial) {
      // Show only first 2-4 characters
      const atIndex = email.indexOf('@');
      if (atIndex > 0) {
        const showChars = Math.min(4, Math.max(2, Math.floor(atIndex / 2)));
        const masked = email.substring(0, showChars) + '•'.repeat(atIndex - showChars) + email.substring(atIndex);
        return { value: masked, className: '' };
      }
    }
    return { value: email, className: '' };
  };

  const formatPropertyAddress = (address, city, state, zip) => {
    if (blurSettings.propertyAddress) {
      return {
        address: address || '',
        addressClass: blurClass,
        cityStateZip: `${city || ''}, ${state || ''} ${zip || ''}`.trim(),
        cityStateZipClass: blurClass,
      };
    }
    if (blurSettings.propertyAddressPartial) {
      return {
        address: address || '',
        addressClass: '',
        cityStateZip: `${city || ''}, ${state || ''} ${zip || ''}`.trim(),
        cityStateZipClass: blurClass,
      };
    }
    return {
      address: address || '',
      addressClass: '',
      cityStateZip: `${city || ''}, ${state || ''} ${zip || ''}`.trim(),
      cityStateZipClass: '',
    };
  };

  const formatMailingAddress = (address, city, state, zip) => {
    if (blurSettings.mailingAddress) {
      return {
        address: address || '',
        addressClass: blurClass,
        cityStateZip: `${city || ''}, ${state || ''} ${zip || ''}`.trim(),
        cityStateZipClass: blurClass,
      };
    }
    if (blurSettings.mailingAddressPartial) {
      return {
        address: address || '',
        addressClass: '',
        cityStateZip: `${city || ''}, ${state || ''} ${zip || ''}`.trim(),
        cityStateZipClass: blurClass,
      };
    }
    return {
      address: address || '',
      addressClass: '',
      cityStateZip: `${city || ''}, ${state || ''} ${zip || ''}`.trim(),
      cityStateZipClass: '',
    };
  };

  return {
    blurSettings,
    blurClass,
    formatName,
    formatPhone,
    formatEmail,
    formatPropertyAddress,
    formatMailingAddress,
    isAnyBlurActive: Object.values(blurSettings).some(v => v),
  };
}

export default useSensitiveBlur;

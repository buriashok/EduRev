import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styles from './AvatarUpload.module.css';

const AvatarUpload = ({ currentImage, onUpload }) => {
  const [preview, setPreview] = useState(currentImage);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onUpload(file);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    maxSize: 1024 * 1024,
  });

  return (
    <div className={styles.container}>
      <div {...getRootProps()} className={`${styles.dropzone} ${isDragActive ? styles.active : ''}`}>
        <input {...getInputProps()} />
        <img src={preview || 'https://ui-avatars.com/api/?background=0f62fe&color=ffffff&name=EduRev'} alt="Profile" className={styles.avatar} />
        <div className={styles.overlay}>
          <span>{isDragActive ? 'Drop here' : 'Change Avatar'}</span>
        </div>
      </div>
      <p className={styles.hint}>Drag & drop or click to upload (max 1MB)</p>
    </div>
  );
};

export default AvatarUpload;

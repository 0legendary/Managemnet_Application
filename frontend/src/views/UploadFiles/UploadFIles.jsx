import React, { useCallback, useRef, useState } from 'react';
import { FileUploaderRegular } from '@uploadcare/react-uploader';
import '@uploadcare/react-uploader/core.css';
import {
  deleteFile,
  UploadcareSimpleAuthSchema,
} from '@uploadcare/rest-client';

function UploadFIles({ setFiles, files, mainImage }) {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const ctxProviderRef = useRef(null);

  const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
    publicKey: 'd32886e1d808b4ca34c7',
    secretKey: '6e1d0d6e98cb0062962e',
  });

  const handleRemoveClick = useCallback(
    (uuid) => {
      setFiles(files.filter((f) => f.uuid !== uuid));
        if (uuid) {
        deleteFile(
          { uuid: uuid },
          { authSchema: uploadcareSimpleAuthSchema }
        );
      }
    },
    [files, setFiles]
  );
  

  const resetUploaderState = () => ctxProviderRef.current?.uploadCollection.clearAll();

  const handleModalCloseEvent = () => {
    resetUploaderState();
    setFiles([...files, ...uploadedFiles]);
    setUploadedFiles([]);
  };

  const handleChangeEvent = (items) => {
    const successfulFiles = items.allEntries
      .filter(file => file.status === 'success' && file.fileInfo)
      .map(file => ({
        uuid: file.fileInfo.uuid,
        name: file.fileInfo.name,
        size: file.fileInfo.size,
        mimeType: file.fileInfo.mimeType,
        cdnUrl: file.fileInfo.cdnUrl,
        mainImage: mainImage
      }))
      .filter(fileInfo => fileInfo.uuid && fileInfo.name && fileInfo.size);

    setUploadedFiles([...successfulFiles]);

  };
  const displayedFiles = mainImage ? files?.filter(file => file.mainImage) : files?.filter(file => !file.mainImage);
  return (
    <div className="uploaded-images mt-3 w-100">
      <FileUploaderRegular
        onChange={handleChangeEvent}
        onModalClose={handleModalCloseEvent}
        pubkey="d32886e1d808b4ca34c7"
        apiRef={ctxProviderRef}
        imgOnly={true}
        multiple
        confirmUpload={false}
        removeCopyright

      />
      <div className="uploaded-images-previews">
        {displayedFiles && displayedFiles.length > 0 && (
          <div className='mt-3 me-3 d-flex'>
            {displayedFiles.map((file) => (
              <div key={file.uuid} className="uploaded-file-preview d-flex">
                <img src={file.cdnUrl} alt={file.name} width="100" />
                <i class="bi bi-x-circle-fill" onClick={() => handleRemoveClick(file.uuid)}></i>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UploadFIles

import axios from 'axios';
import React, { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { Editor } from '@tinymce/tinymce-react';

const AdminCreatenotice = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    files: [],
    fileList: [],
    isPinned: 0,
  });
  const editorRef = useRef(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [currentUpload, setCurrentUpload] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const UploadModal = ({ progress, fileName }) => {
    showUploadModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">파일 업로드 중...</h3>
          <p className="text-sm text-gray-600 mb-4">파일 : fileName</p>
          <div className="relative pt-1">
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-gray-200">
              <div
                style={{ width: `${progress}%` }}
                className="shadow-none flex foex-col text-center whitespace-nowrap text-white justify-center"
              />
            </div>
            <div className="text-center text-sm text-gray-600">
              {progress.toFixed(0)}%
            </div>
          </div>
        </div>
      </div>
    )

  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const editorContent = editorRef.current.getContent();
    setShowUploadModal(true);

    try {
      // const uploadedFiles = await Promise.all(
      //   formData.files.map(async (file) => {
      //     setCurrentUpload(file.name);
      //     const fileFormData = new FormData();
      //     const encodeFileName = encodeURIComponent(file.name);
      //     fileFormData.append("file", file);
      //     fileFormData.append("originalName", encodedFileName);

      //     const response = await axios.post("http://localhost:3001/api/upload/file",
      //       fileFormData,
      //       {
      //         withCredentials: true,
      //         headers: {
      //           "Content-Type": "multipart/form-data",
      //         },
      //         onUploadProgress: (progressEvent) => {
      //           const percentComdpleted = Math.round((progressEvent.loaded * 100)) / progressEvent.total;
      //           setUploadProgress((prev) => ({
      //             ...prev,
      //             [file.name]: percentComdpleted,
      //           }));
      //         },
      //       }
      //     );
      //     return response.data.fileUrl;
      //   })
      // );

      const postData = {
        businessGroup: "VIST",
        purpose: formData.purpose,
        title: formData.title,
        content: editorContent,
        //fileUrl: uploadedFiles,
        isPinned: formData.isPinned,
        authorId: "admin001",
      };

      await axios.post("http://localhost:3001/api/notice", postData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        }
      });

      setShowUploadModal(false);
      navigate("/admin/notices");
    } catch (error) {
      console.error("공지사항 등록 실패: " + error);
      setShowUploadModal(false);
    }

  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const newFileList = newFiles.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      file: file
    }));

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...newFiles],
      fileList: [...prev.fileList, ...newFileList],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="bg-white rounded-lg shadow-lg p-4 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-8 text-gray-800">공지사항 작성</h2>

        <form className="space-y-4 sm:space-y-8">
          <div>
            <label
              htmlFor="title"
              className="block text-lg sm:text-xl font-medium text-gray-700 mb-2">
              제목
            </label>
            <div className="flex items-center space-x-2">
              <select
                id="purpose"
                className="border rounded px-3 py-2 text-base"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="">공지목적</option>
                <option value="1">안내</option>
                <option value="2">점검</option>
                <option value="3">공지</option>
              </select>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 text-base sm:text-lg p-2 sm:p-3"
                placeholder="제목을 입력하세요"
                required
              />
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned === 1}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked ? 1 : 0 })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm sm:text-base text-gray-700 whitespace-nowrap">상단 고정</span>
              </label>
            </div>
          </div>
          <div>
            <label
              htmlFor="content"
              className="block text-lg sm:text-xl font-medium text-gray-700 mb-2">
              내용
            </label>
            <Editor
              apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
              onInit={(evt, editor) => editorRef.current = editor}
              initialValue={formData.content}
              init={{
                height: 500,
                menubar: true,
                toolbar_mode: "scrolling",
                toolbar_sticky: true,
                toolbar_location: "top",
                plugins: [
                  "advlist",
                  "autolink",
                  "lists",
                  "link",
                  "image",
                  "charmap",
                  "preview",
                  "anchor",
                  "searchreplace",
                  "visualblocks",
                  "code",
                  "fullscreen",
                  "insertdatetime",
                  "media",
                  "table",
                  "code",
                  "help",
                  "wordcount",
                ],
                toolbar:
                  "undo redo | blocks | " +
                  "bold italic | alignleft aligncenter " +
                  "alignright | bullist numlist | " +
                  "image | help",
                content_style:
                  "body { font-family: Helvetica, Arial, sans-serif; font-size: 14px; } @media (max-width:768px) { body { font-size:16px; } }",
                images_upload_handler: async (blobInfo, progress) => {
                  try {
                    const formData = new FormData();
                    formData.append("image", blobInfo.blob());

                    const response = await axios.post("http://localhost:3001/api/upload/image",
                      formData,
                      {
                        withCredentials: true,
                        headers: {
                          "Content-Type": "multipart/form-data",
                        },
                      }
                    );

                    return response.data.imageUrl;
                  } catch (error) {
                    console.error("이미지 업로드 실패: " + error);
                    return error;
                  }
                },
                file_picker_types: "image",
                automatic_uploads: true,
                file_picker_callback: function (cb, value, meta) {
                  const input = document.createElement("input");
                  input.setAttribute("type", "file");
                  input.setAttribute("accept", "image/*");

                  input.onchange = function () {
                    const file = this.files[0];
                    const reader = new FileReader();
                    reader.onload = function () {
                      const id = "blobid" + new Date().getTime();
                      const blobCache =
                        editorRef.current.editorUpload.blobCache;
                      const base64 = reader.result.split(",")[1];
                      const blobInfo = blobCache.create(id, file, base64);
                      cb(blobInfo.blobUri(), { title: file.name });
                    };
                    reader.readAsDataURL(file);
                  };
                  input.click();
                },
              }}
            />
          </div>

          <div>
            <label htmlFor="files" className="block text-lg sm:text-xl font-medium text-gray-700 mb-2">
              첨부파일
            </label>
            <input type="file" id="files" multiple className="mt-1 block w-full text-base sm:text-lg text-gray-500 file:mr-2 sm:file:mr-4 file:py-2 sm:file:py-3 file:px-4 sm:file:px-6 file:rounded-lg file:border file:text-base sm:file:text-lg file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />

            {formData.fileList.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="font-medium text-gray-700">첨부된 파일:</p>
                <ul className="bg-gray-50 rounded-lg divide-y divide-gray-200">
                  {formData.fileList.map((file, index) => (
                    <li
                      key={file.id}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-6 h-6 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.29315.414 4.414 0 00.582.31572.375.375 0 00.43-.14535.375.375 0 00.033-.11553V19.5a2.25 2.25 0 01-2.25 2.25H9z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFileDelete(file.id)}
                        className="text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0 4h.01M9 14h6"
                          />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8">
            <button type="submit" onClick={handleSubmit} className="w-full sm:w-auto sm:px-6 py-2 sm:py03 text-base sm:text-lg font-medium text-white bg-blue-600 border-2 border-transparent rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none transition-all duration-300 ">
              저장
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/notices")}
              className="w-full sm:w-auto sm:px-6 py-2 sm:py03 text-base sm:text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none transition-all duration-300">
              취소
            </button>
          </div>
        </form>
      </div>
      <UploadModal
        progress={uploadProgress[currentUpload] || 0}
        filename={currentUpload || ""}
      />
    </div>
  )
}

export default AdminCreatenotice

import { useState } from "react";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setImgUrl("");
    setVideoUrl("");
    setIsLoading(true);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.blob())
      .then((blob) => {
        setIsLoading(false);
        const url = window.URL.createObjectURL(blob);
        setVideoUrl(url);
      })
      .catch((error) => {
        // Handle any errors
      });
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer
      ? e.dataTransfer.files
      : e.nativeEvent.dataTransfer.files;
    const formData = new FormData();
    formData.append("file", files[0]);

    setImgUrl("");
    setVideoUrl("");
    setIsLoading(true);

    fetch("/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.blob()) // Assuming the backend returns a file
      .then((blob) => {
        // Create a URL for the video blob
        setIsLoading(false);
        const url = window.URL.createObjectURL(blob);
        if (files[0].type === "video/mp4") setVideoUrl(url);
        else setImgUrl(url);
      })
      .catch((error) => {
        // Handle any errors
      });
  };
  return (
    <>
      <div className="flex flex-col justify-center items-center py-10 px-5 md:px-24 gap-10 bg-neutral-950 text-white min-h-screen">
        <h1 className="text-5xl font-semibold text-center">
          Lane Detection System®
        </h1>
        <div
          className={`flex items-center justify-center w-full ${
            isDragOver
              ? "border-blue-800 bg-blue-300"
              : "border-gray-800 bg-gray-500"
          } border-2 border-dashed rounded-lg cursor-pointer bg-neutral-800`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <label
            htmlFor="dropzone-file"
            className="flex flex-col items-center justify-center w-full h-64 rounded-lg cursor-pointer bg-neutral-800 hover:bg-neutral-900 transition-all"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag
                and drop
              </p>
              <p className="text-xs text-gray-500">Image or Video files only</p>
            </div>
            <input
              id="dropzone-file"
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e)}
            />
          </label>
        </div>
        {isLoading && <Loader />}
        <div className="mb-20">
          {videoUrl && (
            <video controls>
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
          {imgUrl && <img src={imgUrl} alt="result" />}
        </div>
        <Footer />
      </div>
    </>
  );
}

const Loader = () => {
  return (
    <div className="flex gap-3 items-center" role="status">
      <svg
        aria-hidden="true"
        className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
        viewBox="0 0 100 101"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor"
        />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">Loading...</span>
      Loading...
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="fixed bottom-0 w-full flex flex-col justify-center items-center gap-1 p-3 bg-neutral-950 border-t border-neutral-800">
      <h2>Group Members</h2>
      <div className="flex items-center justify-center gap-3">
        <p>Abdul Ahad Qureshi - 368115</p>
        <p>Hamza Khursheed - 372135</p>
        <p>Haram Iqbal - 387742</p>
        <p>Shavaiz Butt - 370981</p>
      </div>
    </footer>
  );
};

export default App;

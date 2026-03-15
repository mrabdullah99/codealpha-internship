const NewsLetter = () => {
  return (
    <div className="max-w-5xl mx-auto flex flex-col items-center justify-center text-center gap-2 pt-8 pb-14">
      <h1 className="text-2xl md:text-4xl font-medium ">
        Subscribe now & get 20% off
      </h1>
      <p className="md:text-base text-gray-500/80 pb-8">
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry.
      </p>
      <div className="flex items-center justify-between max-w-2xl w-full md:h-12 h-10">
        <input
          type="email"
          placeholder="Enter your email id"
          className="text-gray-500 h-full w-full py-3 px-7 border border-gray-500/30 rounded-md rounded-r-none
          outline-none"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white h-full px-5  rounded-r-md">
          Subscribe
        </button>
      </div>
    </div>
  );
};

export default NewsLetter;

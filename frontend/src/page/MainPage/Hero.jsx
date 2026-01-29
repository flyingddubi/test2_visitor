import React from "react";
import HeroImage from "../../assets/image_1.jpg";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="relative min-h-[100vh] bg-grad-to-b from-gray-50 to-white pb-0">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-3xl sm:text-4xl 2xl:text-6xl font-bold text-gray-900 leading-tight mb-6 lg:mb-12">
              CONNECT
              <span className="block text-blue-600 mt-2 lg:mt-6">
                TO THE FUTURE
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-800 text-semibold mb-8 max-w-2xl mx-auto">
              초지능·초융합·초연결 기술로 인류를 더 풍요롭고 안전하게
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/request">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg font-semibold shadow-lg hover:shadow-xl">
                  방문 신청하기
                </button>
              </Link>
              <a 
                href="https://www.hanwhasystems.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors duration-300 text-lg font-semibold shadow-lg inline-block text-center"
              >
                더 알아보기
              </a>
            </div>
          </div>
          <div className="flex-1 w-full max-w-2xl lg:max-w-none">
            <div className="relative">
              <img
                src={HeroImage}
                className="relative rounded-2xl shadow-2xl w-full object-cover transform hover:scale-[1.02] transition-transform duration-300"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
          {[
            { number: "Defense", label: "첨단 IT 기술을 기반으로 항공전자, 우주, 감시정찰, 지휘통제/통신, 정밀타격 등의 분야에서 군(軍)이 필요로 하는 최상의 솔루션을 제공합니다." },
            { number: "ICT", label: "최고의 IT역량과 노하우로 고객에게 특화된 맞춤형 서비스를 제공합니다." },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {stat.number}
              </div>
              <div className="text-gray-900">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hero;

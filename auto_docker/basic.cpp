#include <iostream>
#include <string>
#include <cmath>
#include <string>
#include <vector>

namespace basic {
	void showAkhila() {
		std::cout << "Hi Akhila" << std::endl;
	}
	void showString(const std::string &msg) {
		std::cout << msg << std::endl;
	}
	void showNumber(double num) {
		std::cout << num << std::endl;
	}

}

namespace led {
  void on() {
    std::cout << "LED is ON" << std::endl;
  }
}


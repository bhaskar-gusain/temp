CC       = aarch64-linux-gnu-g++
BIN_DIR  = binary
BUILD_DIR= build
INC_DIR  = header

TARGET   = $(BIN_DIR)/final_bin
SRC      = main.cpp
OBJ      = $(BUILD_DIR)/main.o

# --- Include flags only if header directory exists ---
INCLUDE_FLAGS = $(if $(wildcard $(INC_DIR)), -I$(INC_DIR),)

CFLAGS  = $(INCLUDE_FLAGS) -Wall
LDFLAGS = ""

all: $(TARGET)

$(TARGET): $(OBJ)
	@mkdir -p $(BIN_DIR)
	$(CC) $(OBJ)  -o $@ 

$(OBJ): $(SRC)
	@mkdir -p $(BUILD_DIR)
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	@if [ -n "$(wildcard $(BUILD_DIR)/*.o)" ]; then \
		echo "Cleaning build artifacts..."; \
		rm -rf $(BUILD_DIR) $(BIN_DIR) ; \
	else \
		echo "Nothing to clean."; \
	fi

.PHONY: all clean

# Compiler and Flags
# CXX       = g++
# CXXFLAGS  = -Wall -I$(INC_DIR)
# LDFLAGS   = -lm

# # Directories
# SRC_DIR   = src/main.cpp
# INC_DIR   = header
# BUILD_DIR = build
# BIN_DIR   = binary

# # Target
# TARGET    = $(BIN_DIR)/final_bin

# # Sources and Objects
# SRC       = $(wildcard $(SRC_DIR)/*.c $(SRC_DIR)/*.cpp)
# OBJ       = $(patsubst $(SRC_DIR)/%, $(BUILD_DIR)/%, $(SRC:.c=.o))
# OBJ       := $(patsubst $(SRC_DIR)/%, $(BUILD_DIR)/%, $(OBJ:.cpp=.o))

# # Default rule
# all: $(TARGET)

# # Link target
# $(TARGET): $(OBJ)
# 	@mkdir -p $(BIN_DIR)
# 	$(CXX) $(OBJ) $(LDFLAGS) -o $@
# 	@echo "Build complete: $@"

# # Compile rule
# $(BUILD_DIR)/%.o: $(SRC_DIR)/%.c
# 	@mkdir -p $(BUILD_DIR)
# 	$(CXX) $(CXXFLAGS) -c $< -o $@

# $(BUILD_DIR)/%.o: $(SRC_DIR)/%.cpp
# 	@mkdir -p $(BUILD_DIR)
# 	$(CXX) $(CXXFLAGS) -c $< -o $@

# # Clean rule
# clean:
# 	@if [ -d "$(BUILD_DIR)" ] || [ -d "$(BIN_DIR)" ]; then \
# 		echo "Cleaning build artifacts..."; \
# 		rm -rf $(BUILD_DIR) $(BIN_DIR); \
# 	else \
# 		echo "Nothing to clean."; \
# 	fi

# .PHONY: all clean

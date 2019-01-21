c++ = g++
cc = gcc
# opcs=-Wall -Wno-unused-result -O3 -ffast-math -Warray-bounds
opcs = -Wall -O0 -g -Warray-bounds
	
training : training.c svm.c utils.c
	$(c++) $(opcs) training.c svm.c utils.c -o training

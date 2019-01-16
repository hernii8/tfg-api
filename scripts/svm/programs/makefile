c++ = g++
cc = gcc
opcs = -Wall -Wno-unused-result -O3 -ffast-math -Warray-bounds
# opcs = -Wall -O0 -g -Warray-bounds
	
svm : svm.c classification.c
	$(c++) $(opcs) svm.c classification.c utils.c -o svm

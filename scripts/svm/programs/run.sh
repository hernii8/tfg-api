#!/bin/bash
model=svm
basedir=..
dataset=lesiones
args_model='2 C 20 16384 8192 4096 2048 1024 512 256 128 64 32 16 8 4 2 1 0.5 0.25 0.125 0.0625 0.0312 gamma 25 256 128 64 32 16 8 4 2 1 0.5 0.25 0.125 0.0625 0.03125 0.01562 0.00781 0.00391 0.00195  0.00098 0.00049 0.00024 0.00012 0.00006 0.00003 1.5e-5'
# args_model='2 C 2 100 1 gamma 4 1 0.1 0.01 0.001'
interactive=1

clear
./svm $model $basedir $dataset $args_model $interactive

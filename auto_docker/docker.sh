#!/bin/bash

bash -c "\
	docker run -it --rm --name test -v $(pwd):/ws aflex02/flex_toolchain:v1.0 clean && \
	docker run -it --rm --name test -v $(pwd):/ws aflex02/flex_toolchain:v1.0 && \
	scp -r /home/bhaskargusain/Desktop/empty/auto_docker/binary/final_bin  root@192.168.68.124:/root/nocode "

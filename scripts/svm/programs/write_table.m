function write_table(nf,pattern,output,input_name)
f=open_file(nf,'w');[np ni]=size(pattern);
if ~exist('input_name','var')
    input_name=cell(1,ni);
    for i=1:ni
        input_name{i}=sprintf('f%i',i);
    end
end
fmt=cell(1,ni);
for i=1:ni
    l=length(input_name{i});fmt{i}=sprintf('\t%%%ig',l);
    fprintf(f,sprintf('\t%%%is',l),input_name{i});
end
fprintf(f,'\t%10s\n','fallo');
for i=1:np
	fprintf(f,'%i',i);
    for j=1:ni
        fprintf(f,fmt{j},pattern(i,j));
    end
    fprintf(f,'\t%10i\n',output(i));
end
fclose(f);

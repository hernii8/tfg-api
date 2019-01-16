input_name_inic=cell(1,ni);discrete=zeros(1,ni);val=cell(1,ni);
nval=ones(1,ni);pos=zeros(1,ni);f2=open_file(nf2,'r');
for i=1:ni
    input_name_inic{i}=fscanf(f2,'%s',1);type=fscanf(f2,'%s',1);
    if strcmp(type,'discrete')
        discrete(i)=1;n=fscanf(f2,'%i',1);
        val{i}=cell(1,n);nval(i)=n;
        for j=1:n
            val{i}{j}=fscanf(f2,'%s',1);
        end
    end
end
fclose(f2);ni2=sum(nval);indicator=zeros(1,ni2);input_name=cell(1,ni2);k=1;
for i=1:ni
    pos(i)=k;
    if discrete(i)
        for j=1:nval(i)
            input_name{k}=sprintf('%s-%s',input_name_inic{i},val{i}{j});
            indicator(k)=1;k=k+1;
        end
    else
        input_name{k}=input_name_inic{i};k=k+1;
    end
end

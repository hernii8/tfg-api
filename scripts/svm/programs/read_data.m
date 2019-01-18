function [x cl ni nc input_name class_name indicator]=read_data(dataset,nf,np,ni) %#ok<STOUT>
    nf2=strcat('../data/',dataset,'/original/', dataset,'_input_names.txt'); %#ok<NASGU>
    read_input_names  % input_name is created here
    x=zeros(np,ni2);cl=zeros(1,np);
    class_name={'DESESTIMATORIO','ESTIMATORIO-PARCIAL','ESTIMATORIO'};
    nc=numel(class_name);
    nf = strcat('../data/', dataset, "/", nf);
    f=open_file(nf,'r');fscanf(f,'%s',1+ni);
    init_progress;iexp=1;nexp=np; %#ok<NASGU>
    for i=1:np
        t= fscanf(f,'%s',1);  % lectura da clase
        for j=1:nc
            if strcmp(t,class_name(j))
                cl(i)=j; break
            end
        end
        for j=1:ni
            t=fscanf(f,'%s',1);p=pos(j);
            if ~discrete(j)
                x(i,p)=str2double(t);
            else
                k=codify_string(t,val{j});x(i,p+k-1)=1; %#ok<USENS>
            end
        end
        print_progress;iexp=iexp+1;
    end
    end_progress
    fclose(f);
    ni=ni2;
end

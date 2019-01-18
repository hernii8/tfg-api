function []=create_dataset(dataset, n_lineas)
% clear all
clc
addpath(pwd)
% dataset='delitos_salud_e_integridad';

fprintf('---------------------------------------\n')
fprintf('creating dataset %s ...\n',dataset);

nf=strcat('original/',dataset,'.csv');np=(n_lineas-1);ni=22;

% data reading
[x cl ni nc input_name class_name indicator]=read_data(dataset,nf,np,ni);

% filtering patterns and inputs
nf=sprintf('../data/%s/%s.log',dataset,dataset);f=open_file(nf,'w');

% removes constant inputs
supr=zeros(1,ni);  %supr=constant inputs to be removed
for i=1:ni
	if std(x(:,i))==0
		supr(i)=1;
	end
end
en_supr=find(supr);nes=numel(en_supr);
if nes>0
	fprintf(f,'removed %i constant inputs: ',nes);fprintf(f,'%s ',input_name{en_supr});fprintf(f,'\n');
    fprintf('removed %i constant inputs: ',nes);fprintf('%i ',en_supr);fprintf('\n');
	x(:,en_supr)=[];ni=ni-nes;input_name(en_supr)=[];indicator(en_supr)=[];
else
    fprintf(f,'no constant input removed\n');
end

% removes repeated patterns
fprintf('removing repeated patterns ...\n')
nspc=7;fprintf(repmat(' ',1,nspc));str=repmat('\b',1,nspc);repeated=zeros(1,np);
for i=1:np
    if repeated(i)==0
        v=find(all(bsxfun(@eq,x(i,:),x(i+1:np,:)),2));
        if numel(v)>0
            repeated(i+v)=1;
            for j=v
                fprintf(f,'removed pattern %i repeated with %i\n',i+j,i);
            end
        end
        fprintf(str);fprintf('%6.2f%%',100*i/np);
    end
end
fprintf('\n')
rep=find(repeated);nrep=length(rep);x(rep,:)=[];cl(rep)=[];np=size(x,1);

if nrep==0
    fprintf(f,'no repeated patterns removed\n');
else
    fprintf(f,'removed %i repeated patterns\n',nrep);
end

fclose(f);

% creating file with the whole data set (preprocessed)
nf=sprintf('../data/%s/mean_std.dat',dataset);f=open_file(nf,'w');
fprintf(f,'%10s %10s %10s\n','input','mean','std');
t=x;
for i=1:ni
    if indicator(i)
        fprintf(f,'%10i indicator\n',i);
    else
        u=t(:,i);avg=mean(u);dev=std(u);
        if dev~=0
            t(:,i)=(u-avg)/dev;
        end
        fprintf(f,'%10i %10g %10g\n',i,avg,dev);
    end
end
fclose(f);%clear indicator
nf=sprintf('../data/%s/%s.dat',dataset,dataset);
write_table(nf,t,cl,input_name);

% minimum number of pattern per class, and kfold
npc_min=inf;npc=zeros(1,nc);
for i=1:nc
	n=sum(cl==i);
    if n==0
        error('class %i has zero patterns',i)
    end
    npc_min=min(n,npc_min);npc(i)=n;
end
kfold=4;train_folds=2;valid_folds=1;test_folds=1;
% kfold=10;train_folds=6;valid_folds=2;test_folds=2;

% creation of folds
fprintf('creating folds ...\n')
kf1=kfold-1;ind=cell(nc,kfold); % indices of patterns of each class for each fold
for i=1:nc    
    t=find(cl==i);n=npc(i);u=randperm(n);n2=ceil(n/kfold);
    if n2*kf1>=n
        n2=n2-1;
    end
    for j=1:kf1  % all folds except last
        ini=(j-1)*n2+1;fin=ini+n2-1;w=u(ini:fin);ind{i,j}=t(w);
    end
    ini=fin+1;fin=n;w=u(ini:fin);ind{i,kfold}=t(w);  % last fold
end
%ntp/nvp/nsp=no. training/validation/test patterns for each fold
ntp=zeros(1,kfold);nvp=zeros(1,kfold);nsp=zeros(1,kfold);x2=zeros(np,ni);
nf=sprintf('../data/%s/folds/%s_partitions.dat',dataset,dataset);
f=open_file(nf,'w');
nf=sprintf('../data/%s/folds/mean_std_folds_%s.dat',dataset,dataset);
f2=open_file(nf,'w');
fprintf(f2,'%10s %10s %10s\n','input','mean','std');
for i=1:kfold
    ti=[];vi=[];si=[];j=i;
    for k=1:train_folds
        for l=1:nc
            ti=[ti ind{l,j}]; %#ok<*AGROW>
        end
        j=update(j,kfold);
    end    
    for k=1:valid_folds
        for l=1:nc
            vi=[vi ind{l,j}];
        end
        j=update(j,kfold);
    end
    for k=1:test_folds
        for l=1:nc
            si=[si ind{l,j}];
        end
        j=update(j,kfold);
    end
    ntp(i)=numel(ti);nvp(i)=numel(vi);nsp(i)=numel(si);
    verify_partition  % verifies partition of current fold
    %preprocesing zero mean standard deviation one
    fprintf(f2,'fold %i\n',i);
    for j=1:ni
        if indicator(j)
            x2(:,j)=x(:,j);
        else
            t=x(ti,j);avg=mean(t);dev=std(t);
            if dev~=0
                x2(:,j)=(x(:,j)-avg)/dev;
            end
        end
        fprintf(f2,'%10s: %10g %10g\n',input_name{j},avg,dev);
    end
    % writes training,validation and test sets for current fold
    nf=sprintf('../data/%s/folds/%s_training_%i.dat',dataset,dataset,i);
    write_table(nf,x2(ti,:),cl(ti),input_name);
    nf=sprintf('../data/%s/folds/%s_validation_%i.dat',dataset,dataset,i);
    write_table(nf,x2(vi,:),cl(vi),input_name);
    nf=sprintf('../data/%s/folds/%s_test_%i.dat',dataset,dataset,i);
    write_table(nf,x2(si,:),cl(si),input_name);
    fprintf(f,'%i ',ti);fprintf(f,'%i ',vi);fprintf(f,'%i ',si);fprintf(f,'\n');
end
fclose(f);fclose(f2);

% writing dataset information to file dataset/dataset.txt
fprintf('writing %s.txt ...\n',dataset)
nf=sprintf('../data/%s/%s.txt',dataset,dataset);
f=open_file(nf,'w');
fprintf(f,'np= %i\n',np);  % pattern number
fprintf(f,'ni= %i\n',ni);  % input number
fprintf(f,'nc= %i\n',nc);  % class number
for i=1:nc
    fprintf(f,'class %i: %s\n',i,class_name{i});
end
fprintf(f,'kfold= %i\n',kfold);  % number of trials
for i=1:kfold
    fprintf(f,'fold %i: ntp= %i nvp= %i nsp= %i\n',i,ntp(i),nvp(i),nsp(i));
end
fclose(f);

fprintf('created %s\n',dataset)
% msgbox(sprintf('FINISHED CREATE_DATASET %s',dataset))
exit
end
FROM ubuntu:focal

# Get latest packages
RUN ln -fs /usr/share/zoneinfo/Europe/London /etc/localtime \
  && apt-get update \
  && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    git \
    gpg-agent \
    graphviz \
    make \
    nano \
    python3-pip \
    software-properties-common \
    sudo \
    unzip \
    vim \
    z3 \
    m4 \
    libgmp-dev \
    python2.7 \
  && rm -rf /var/lib/apt/lists/* /tmp/*

RUN add-apt-repository ppa:avsm/ppa \
  && apt-get update \
  && apt-get -y --no-install-recommends install opam

RUN useradd dev \
  && echo "dev:dev" | chpasswd \
  && adduser dev sudo \
  && mkdir /home/dev \
  && chown dev:dev /home/dev

RUN mkdir /home/dev/bin
RUN mkdir /home/dev/dependencies
 
COPY --chown=dev:dev \
  nuscr /home/dev/nuscr/

COPY --chown=dev:dev \
  codegen /home/dev/codegen/

COPY --chown=dev:dev \
  web-sandbox /home/dev/web-sandbox/

COPY --chown=dev:dev \
  protocols /home/dev/protocols/

COPY --chown=dev:dev \
  case-studies /home/dev/case-studies/

##############################################################################
# Codegen
##############################################################################

COPY --chown=dev:dev \
  codegen/requirements.txt /home/dev/dependencies/requirements.codegen.txt

# Setup Python
RUN add-apt-repository -y ppa:deadsnakes/ppa \
  && apt-get install -y python3.8 \
  && echo python3.8 --version

RUN python3.8 -m pip install -r /home/dev/dependencies/requirements.codegen.txt

# Setup NodeJS
RUN curl -sL https://deb.nodesource.com/setup_14.x -o nodesource_setup.sh \
  && bash ./nodesource_setup.sh \
  && apt-get -y install nodejs build-essential

RUN npm i -g \
  npm typescript typescript-formatter concurrently serve
  
##############################################################################
# Workspace setup
##############################################################################

COPY --chown=dev:dev \
  scripts /home/dev/scripts

RUN chmod +x /home/dev/scripts/*

RUN echo 'alias python=python3.8\neval $(opam env)' \
    >> /home/dev/.bashrc

USER dev

WORKDIR /home/dev

ENV PATH="/home/dev/bin:/home/dev/scripts:$PATH"
ENV SHELL="/usr/bin/bash"
EXPOSE 3000 5000 8080 8888

##############################################################################
# NuScr
##############################################################################

RUN cd /home/dev/nuscr \
  && opam init -y --disable-sandboxing --shell-setup \
  && opam install -y -dt . --deps-only
